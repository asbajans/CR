import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware, roleGuard, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = Router();

const patientSchema = z.object({
  hastaNo: z.string().min(1),
  name: z.string().min(2),
  surname: z.string().min(2),
  tc: z.string().min(1),
  phone: z.string().min(5),
  email: z.string().email().optional(),
  birthDate: z.string().datetime().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
});

router.use(authMiddleware);

router.get(
  '/',
  asyncHandler(async (req: AuthRequest, res) => {
    const { role } = req.user!;
    let patients;
    if (role === 'CALL_CENTER' || role === 'SALES') {
      patients = await prisma.patient.findMany({
        select: { id: true, hastaNo: true, name: true, surname: true, phone: true, email: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      patients = await prisma.patient.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }
    res.json({ success: true, data: patients });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const patient = await prisma.patient.findUnique({
      where: { id: req.params.id },
      include: {
        medicalRecord: true,
        appointments: { orderBy: { appointmentDate: 'desc' } },
        treatmentPlans: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Hasta bulunamadı' });
    }
    res.json({ success: true, data: patient });
  })
);

router.post(
  '/',
  roleGuard('ADMIN', 'CALL_CENTER', 'SALES'),
  asyncHandler(async (req: AuthRequest, res) => {
    const data = patientSchema.parse(req.body);
    const patient = await prisma.patient.create({
      data: {
        hastaNo: data.hastaNo,
        name: data.name,
        surname: data.surname,
        tc: data.tc,
        phone: data.phone,
        email: data.email,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        gender: data.gender,
        address: data.address,
      },
    });
    res.status(201).json({ success: true, data: patient });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const data = patientSchema.partial().parse(req.body);
    const patient = await prisma.patient.update({
      where: { id: req.params.id },
      data: { ...data, ...(data.birthDate ? { birthDate: new Date(data.birthDate) } : {}) },
    });
    res.json({ success: true, data: patient });
  })
);

export default router;
