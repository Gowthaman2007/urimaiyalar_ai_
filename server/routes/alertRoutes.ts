import { Router, Response } from 'express';
import { authMiddleware, requireBusiness, AuthRequest } from '../middleware/auth';
import { db } from '../database/db';

const router = Router();
router.use(authMiddleware, requireBusiness);

router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const alerts = db.alerts.filter(a => a.businessId === req.businessId!);
    res.json({
      success: true,
      data: alerts
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: 'ALERTS_ERROR' });
  }
});

router.post('/:id/read', (req: AuthRequest, res: Response) => {
  const alert = db.alerts.find(a => a.id === req.params.id && a.businessId === req.businessId!);
  if (!alert) {
    return res.status(404).json({ success: false, message: 'Alert not found.', code: 'NOT_FOUND' });
  }
  alert.isRead = true;
  db.persist();
  res.json({ success: true, data: alert });
});

export default router;
