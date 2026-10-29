import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware, roleGuard, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = Router();

const appointmentSchema = z.object({
  randevuNo: z.string().min(1),
  patientId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  type: z.enum(['CONSULTATION', 'TREATMENT']),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  appointmentDate: z.string().datetime(),
  notes: z.string().optional(),
});

router.use(authMiddleware);

router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const { role } = req.user!;
    const where: any = {};
    if (role === 'DENTIST') {
      where.userId = req.user!.id;
    }
    const appointments = await prisma.appointment.findMany({
      where,
      include: { patient: true, user: { select: { id: true, name: true, role: true } } },
      orderBy: { appointmentDate: 'asc' },
    });
    res.json({ success: true, data: appointments });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: { patient: true, user: true },
    });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Randevu bulunamadı' });
    }
    res.json({ success: true, data: appointment });
  })
);

router.post(
  '/',
  roleGuard('ADMIN', 'CALL_CENTER', 'SALES', 'BANKO'),
  asyncHandler(async (req: AuthRequest, res) => {
    const data = appointmentSchema.parse(req.body);
    const appointment = await prisma.appointment.create({
      data: {
        randevuNo: data.randevuNo,
        patientId: data.patientId,
        userId: data.userId,
        type: data.type,
        status: data.status ?? 'PENDING',
        appointmentDate: new Date(data.appointmentDate),
        notes: data.notes,
      },
      include: { patient: true, user: true },
    });
    res.status(201).json({ success: true, data: appointment });
  })
);

router.patch(
  '/:id/status',
  asyncHandler(async (req: AuthRequest, res) => {
    const { status } = z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).parse(req.body);
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status },
      include: { patient: true },
    });
    res.json({ success: true, data: appointment });
  })
);

export default router;
