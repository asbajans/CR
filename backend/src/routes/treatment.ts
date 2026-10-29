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
  items: z.array(planItemSchema),
});

const statusEnum = z.enum(['DRAFT', 'APPROVED', 'IN_PROGRESS', 'COMPLETED']);

router.use(authMiddleware);

router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const plans = await prisma.treatmentPlan.findMany({
      include: {
        patient: { select: { id: true, hastaNo: true, name: true, surname: true } },
        items: true,
        invoices: true,
      },
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
      include: { items: true, invoices: true },
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
      include: {
        patient: true,
        items: { orderBy: { stepOrder: 'asc' } },
        invoices: true,
      },
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
    const plan = await prisma.treatmentPlan.create({
      data: {
        patientId: data.patientId,
        totalPrice: parseFloat(data.totalPrice),
        discount: data.discount ? parseFloat(data.discount) : 0,
        paymentPlan: data.paymentPlan ?? undefined,
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
      include: { items: true, patient: true },
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
      include: { items: true },
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
      include: { items: true, patient: true },
    });
    res.json({ success: true, data: plan });
  })
);

export default router;
