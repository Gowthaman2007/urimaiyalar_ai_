import { Router, Request, Response } from 'express';
import { db } from '../database/db';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const indicators = db.marketIndicators;
    res.json({
      success: true,
      data: indicators
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: 'MARKET_ERROR' });
  }
});

export default router;
