import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware, roleGuard, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = Router();

const planItemSchema = z.object({
  toothNo: z.string().optional(),
  treatment: z.string().min(1),
  price: z.string(),
  quantity: z.number().min(1).default(1),
  stepOrder: z.number().min(1).default(1),
});

const treatmentPlanSchema = z.object({
  patientId: z.string().uuid(),
  totalPrice: z.string(),
  discount: z.string().optional(),
  paymentPlan: z.record(z.any()).optional(),
  channel: z.string().optional(),
  campaignId: z.string().uuid().optional().nullable(),
  items: z.array(planItemSchema),
});

const statusEnum = z.enum(['DRAFT', 'APPROVED', 'IN_PROGRESS', 'COMPLETED']);

const includeRelations = {
  patient: { select: { id: true, hastaNo: true, name: true, surname: true } },
  createdBy: { select: { id: true, name: true, role: true } },
  campaign: { select: { id: true, name: true, channel: true } },
  items: { orderBy: { stepOrder: 'asc' as const } },
  invoices: true,
} as const;

async function resolveChannel(patientId: string, channel?: string, campaignId?: string | null) {
  if (channel) return { channel, campaignId: campaignId ?? null };
  const lead = await prisma.lead.findFirst({
    where: { patientId },
    orderBy: { createdAt: 'asc' },
    select: { source: true, campaignId: true },
  });
  if (lead) return { channel: lead.source, campaignId: campaignId ?? lead.campaignId };
  return { channel: channel || 'Bilinmiyor', campaignId: campaignId ?? null };
}

router.use(authMiddleware);

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const where: Record<string, unknown> = {};
    if (req.query.patientId) where.patientId = req.query.patientId as string;
    if (req.query.status) where.status = req.query.status as string;
    if (req.query.channel) where.channel = req.query.channel as string;
    if (req.query.campaignId) where.campaignId = req.query.campaignId as string;
    if (req.query.createdById) where.createdById = req.query.createdById as string;

    const plans = await prisma.treatmentPlan.findMany({
      where,
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: plans });
  })
);

router.get(
  '/patient/:patientId',
  asyncHandler(async (req: Request, res: Response) => {
    const plans = await prisma.treatmentPlan.findMany({
      where: { patientId: req.params.patientId },
      include: includeRelations,
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: plans });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const plan = await prisma.treatmentPlan.findUnique({
      where: { id: req.params.id },
      include: includeRelations,
    });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Tedavi planı bulunamadı' });
    }
    res.json({ success: true, data: plan });
  })
);

router.post(
  '/',
  roleGuard('ADMIN', 'SALES', 'DENTIST'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = treatmentPlanSchema.parse(req.body);
    const resolved = await resolveChannel(data.patientId, data.channel, data.campaignId);
    const plan = await prisma.treatmentPlan.create({
      data: {
        patientId: data.patientId,
        createdById: req.user!.id,
        totalPrice: parseFloat(data.totalPrice),
        discount: data.discount ? parseFloat(data.discount) : 0,
        paymentPlan: data.paymentPlan ?? undefined,
        channel: resolved.channel,
        campaignId: resolved.campaignId,
        items: {
          create: data.items.map((item) => ({
            toothNo: item.toothNo,
            treatment: item.treatment,
            price: parseFloat(item.price),
            quantity: item.quantity,
            stepOrder: item.stepOrder,
          })),
        },
      },
      include: includeRelations,
    });
    res.status(201).json({ success: true, data: plan });
  })
);

router.patch(
  '/:id/approve',
  roleGuard('ADMIN', 'DENTIST', 'SALES'),
  asyncHandler(async (req: Request, res: Response) => {
    const plan = await prisma.treatmentPlan.update({
      where: { id: req.params.id },
      data: { status: 'APPROVED', approvedAt: new Date() },
      include: includeRelations,
    });
    res.json({ success: true, data: plan });
  })
);

router.patch(
  '/:id/status',
  roleGuard('ADMIN', 'DENTIST', 'SALES'),
  asyncHandler(async (req: Request, res: Response) => {
    const { status } = z.object({ status: statusEnum }).parse(req.body);
    const plan = await prisma.treatmentPlan.update({
      where: { id: req.params.id },
      data: {
        status,
        approvedAt: status === 'APPROVED' ? new Date() : undefined,
      },
      include: includeRelations,
    });
    res.json({ success: true, data: plan });
  })
);

export default router;
