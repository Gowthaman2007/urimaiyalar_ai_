import { Router, Request, Response } from 'express';
import { db } from '../database/db';
import { seedDatabaseIfEmpty } from '../database/seed';

const router = Router();

// Reset and re-seed demo data for presentation
router.post('/reset', async (req: Request, res: Response) => {
  try {
    db.resetToEmpty();
    await seedDatabaseIfEmpty();
    res.json({
      success: true,
      message: 'Database reset to demo presentation state successfully.'
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to reset demo data'
    });
  }
});

export default router;
