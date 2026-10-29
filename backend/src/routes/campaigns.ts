import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { authMiddleware, roleGuard } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = Router();

const campaignSchema = z.object({
  name: z.string().min(2),
  channel: z.string(),
  budget: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

router.use(authMiddleware);

router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const campaigns = await prisma.campaign.findMany({
      include: { _count: { select: { leads: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: campaigns });
  })
);

router.post(
  '/',
  roleGuard('ADMIN', 'SALES'),
  asyncHandler(async (req: Request, res: Response) => {
    const data = campaignSchema.parse(req.body);
    const campaign = await prisma.campaign.create({
      data: {
        name: data.name,
        channel: data.channel,
        budget: data.budget ? parseFloat(data.budget) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
    res.status(201).json({ success: true, data: campaign });
  })
);

export default router;
