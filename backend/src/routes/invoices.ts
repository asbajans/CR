import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware, roleGuard } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = Router();

const invoiceSchema = z.object({
  planId: z.string().uuid(),
  amount: z.string(),
  dueDate: z.string().datetime().optional(),
});

router.use(authMiddleware);

router.get(
  '/',
  roleGuard('ADMIN', 'BANKO'),
  asyncHandler(async (_req, res) => {
    const invoices = await prisma.invoice.findMany({
      include: {
        plan: {
          include: {
            patient: { select: { id: true, hastaNo: true, name: true, surname: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: invoices });
  })
);

router.post(
  '/',
  roleGuard('ADMIN', 'BANKO'),
  asyncHandler(async (req, res) => {
    const data = invoiceSchema.parse(req.body);
    const invoice = await prisma.invoice.create({
      data: {
        planId: data.planId,
        amount: parseFloat(data.amount),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
      include: { plan: { include: { patient: true } } },
    });
    res.status(201).json({ success: true, data: invoice });
  })
);

router.patch(
  '/:id/pay',
  roleGuard('ADMIN', 'BANKO'),
  asyncHandler(async (req, res) => {
    const { paidAmount } = z.object({ paidAmount: z.string() }).parse(req.body);
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Fatura bulunamadı' });
    }
    const newPaid = parseFloat(invoice.paidAmount.toString()) + parseFloat(paidAmount);
    const status = newPaid >= parseFloat(invoice.amount.toString()) ? 'PAID' : 'PARTIAL';
    const updated = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { paidAmount: newPaid, status, paidAt: newPaid >= parseFloat(invoice.amount.toString()) ? new Date() : null },
    });
    res.json({ success: true, data: updated });
  })
);

export default router;
