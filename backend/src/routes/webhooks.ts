import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { z } from 'zod';

const router = Router();

router.post(
  '/meta/leadads',
  asyncHandler(async (req, res) => {
    const { hub } = req.query;
    if (hub?.mode === 'subscribe' && hub?.challenge) {
      if (hub.verify_token === process.env.META_VERIFY_TOKEN) {
        return res.status(200).send(hub.challenge as string);
      }
      return res.status(403).json({ success: false, message: 'Verify token mismatch' });
    }
    res.sendStatus(200);
  })
);

router.get(
  '/meta/leadads',
  asyncHandler(async (req, res) => {
    const { hub } = req.query;
    if (hub?.mode === 'subscribe' && hub?.challenge) {
      if (hub.verify_token === process.env.META_VERIFY_TOKEN) {
        return res.status(200).send(hub.challenge as string);
      }
      return res.status(403).json({ success: false, message: 'Verify token mismatch' });
    }
    res.sendStatus(200);
  })
);

router.post(
  '/meta/messenger',
  asyncHandler(async (_req, res) => {
    res.sendStatus(200);
  })
);

router.post(
  '/meta/instagram',
  asyncHandler(async (_req, res) => {
    res.sendStatus(200);
  })
);

router.post(
  '/whatsapp',
  asyncHandler(async (_req, res) => {
    res.sendStatus(200);
  })
);

export default router;
