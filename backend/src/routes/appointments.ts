import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware, roleGuard, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { nextRandevuNo } from '../lib/serial';
import { z } from 'zod';

const router = Router();

const statusEnum = z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']);
const typeEnum = z.enum(['CONSULTATION', 'TREATMENT']);

const appointmentSchema = z.object({
  randevuNo: z.string().min(1).optional(),
  patientId: z.string().uuid(),
  userId: z.string().uuid().optional().nullable(),
  type: typeEnum,
  status: statusEnum.optional(),
  appointmentDate: z.string().datetime(),
  notes: z.string().optional(),
});

const appointmentUpdateSchema = z.object({
  userId: z.string().uuid().nullable().optional(),
  type: typeEnum.optional(),
  status: statusEnum.optional(),
  appointmentDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

const istanbulDateStr = (date = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(date);

router.use(authMiddleware);

router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { role } = req.user!;
    const where: Record<string, unknown> = {};

    if (role === 'DENTIST') {
      where.userId = req.user!.id;
    }
    if (req.query.status) {
      where.status = req.query.status as string;
    }
    if (req.query.type) {
      where.type = req.query.type as string;
    }
    if (req.query.patientId) {
      where.patientId = req.query.patientId as string;
    }

    const scope = req.query.scope as string | undefined;
    if (scope === 'today') {
      const start = new Date(`${istanbulDateStr()}T00:00:00+03:00`);
      where.appointmentDate = { gte: start, lt: new Date(start.getTime() + 86400000) };
    } else if (scope === 'upcoming') {
      where.appointmentDate = { gte: new Date() };
      where.status = { in: ['PENDING', 'CONFIRMED'] };
    } else if (scope === 'past') {
      where.appointmentDate = { lt: new Date() };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: { patient: true, user: { select: { id: true, name: true, role: true } } },
      orderBy: { appointmentDate: scope === 'past' ? 'desc' : 'asc' },
      take: 300,
    });
    res.json({ success: true, data: appointments });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
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
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = appointmentSchema.parse(req.body);
    const randevuNo = data.randevuNo || (await nextRandevuNo());
    const appointment = await prisma.appointment.create({
      data: {
        randevuNo,
        patientId: data.patientId,
        userId: data.userId || null,
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
  '/:id',
  roleGuard('ADMIN', 'CALL_CENTER', 'SALES', 'BANKO', 'DENTIST'),
  asyncHandler(async (req: Request, res: Response) => {
    const data = appointmentUpdateSchema.parse(req.body);
    const { userId, appointmentDate, ...rest } = data;
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(userId !== undefined ? { userId } : {}),
        ...(appointmentDate ? { appointmentDate: new Date(appointmentDate) } : {}),
      },
      include: { patient: true, user: true },
    });
    res.json({ success: true, data: appointment });
  })
);

router.patch(
  '/:id/status',
  asyncHandler(async (req: Request, res: Response) => {
    const { status } = z.object({ status: statusEnum }).parse(req.body);
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status },
      include: { patient: true },
    });
    res.json({ success: true, data: appointment });
  })
);

export default router;
