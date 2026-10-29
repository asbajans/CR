import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware, roleGuard, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = Router();

const leadSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email().optional(),
  source: z.string(),
  campaignId: z.string().uuid().optional(),
  status: z.enum(['NEW', 'CONTACTED', 'CLINIC_VISIT', 'TREATMENT_APPROVED', 'APPOINTMENT_BOOKED', 'SOLD']).optional(),
  patientId: z.string().uuid().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

router.use(authMiddleware);

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const leads = await prisma.lead.findMany({
      include: { campaign: true, patient: { select: { id: true, hastaNo: true, name: true, surname: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: leads });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
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
  asyncHandler(async (req: AuthRequest, res) => {
    const data = leadSchema.parse(req.body);
    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        source: data.source,
        campaignId: data.campaignId,
        status: data.status ?? 'NEW',
        patientId: data.patientId,
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
  '/:id/status',
  asyncHandler(async (req, res) => {
    const { status } = z.enum(['NEW', 'CONTACTED', 'CLINIC_VISIT', 'TREATMENT_APPROVED', 'APPOINTMENT_BOOKED', 'SOLD']).parse(req.body);
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: { status },
      include: { campaign: true, patient: true },
    });
    res.json({ success: true, data: lead });
  })
);

export default router;
