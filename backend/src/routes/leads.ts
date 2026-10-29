import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware, roleGuard, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = Router();

const leadStatusEnum = z.enum(['NEW', 'CONTACTED', 'CLINIC_VISIT', 'TREATMENT_APPROVED', 'APPOINTMENT_BOOKED', 'SOLD']);

const leadSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email().optional().or(z.literal('')),
  source: z.string(),
  campaignId: z.string().uuid().optional().nullable(),
  status: leadStatusEnum.optional(),
  patientId: z.string().uuid().optional().nullable(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

const leadUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(5).optional(),
  email: z.string().email().optional().or(z.literal('')),
  source: z.string().optional(),
  campaignId: z.string().uuid().nullable().optional(),
  status: leadStatusEnum.optional(),
  patientId: z.string().uuid().nullable().optional(),
});

router.use(authMiddleware);

router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const leads = await prisma.lead.findMany({
      include: { campaign: true, patient: { select: { id: true, hastaNo: true, name: true, surname: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: leads });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: { campaign: true, patient: true },
    });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead bulunamadı' });
    }
    res.json({ success: true, data: lead });
  })
);

router.post(
  '/',
  roleGuard('ADMIN', 'CALL_CENTER', 'SALES'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = leadSchema.parse(req.body);
    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        source: data.source,
        campaignId: data.campaignId || null,
        status: data.status ?? 'NEW',
        patientId: data.patientId || null,
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
      },
      include: { campaign: true },
    });
    res.status(201).json({ success: true, data: lead });
  })
);

router.patch(
  '/:id',
  roleGuard('ADMIN', 'CALL_CENTER', 'SALES'),
  asyncHandler(async (req: Request, res: Response) => {
    const data = leadUpdateSchema.parse(req.body);
    const { email, campaignId, patientId, ...rest } = data;
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(email !== undefined ? { email: email || null } : {}),
        ...(campaignId !== undefined ? { campaignId } : {}),
        ...(patientId !== undefined ? { patientId } : {}),
      },
      include: { campaign: true, patient: true },
    });
    res.json({ success: true, data: lead });
  })
);

router.patch(
  '/:id/status',
  asyncHandler(async (req: Request, res: Response) => {
    const { status } = z.object({ status: leadStatusEnum }).parse(req.body);
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: { status },
      include: { campaign: true, patient: true },
    });
    res.json({ success: true, data: lead });
  })
);

export default router;
