import { Router, Response } from 'express';
import { authMiddleware, requireBusiness, AuthRequest } from '../middleware/auth';
import { FinancialService } from '../services/financialService';

const router = Router();

router.use(authMiddleware, requireBusiness);

// Dashboard Summary with period filters
router.get('/summary', (req: AuthRequest, res: Response) => {
  try {
    const period = (req.query.period as string) || 'today';
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const summary = FinancialService.getDashboardSummary(req.businessId!, period, startDate, endDate);
    res.json({
      success: true,
      data: summary
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch dashboard summary',
      code: 'DASHBOARD_ERROR'
    });
  }
});

// Chart trends (sales, expenses, purchases over 7 or 30 days)
router.get('/trends', (req: AuthRequest, res: Response) => {
  try {
    const days = parseInt(req.query.days as string, 10) || 7;
    const trends = FinancialService.getFinancialTrend(req.businessId!, days);
    res.json({
      success: true,
      data: trends
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch trends',
      code: 'TRENDS_ERROR'
    });
  }
});

export default router;
