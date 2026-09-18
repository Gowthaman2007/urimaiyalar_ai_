import { Router, Response } from 'express';
import { authMiddleware, requireBusiness, AuthRequest } from '../middleware/auth';
import { FinancialService } from '../services/financialService';

const router = Router();
router.use(authMiddleware, requireBusiness);

router.get('/summary', (req: AuthRequest, res: Response) => {
  try {
    const period = (req.query.period as string) || 'this_month';
    const summary = FinancialService.getDashboardSummary(req.businessId!, period);
    const totalRevenue = summary.totalSales;
const costOfGoodsSold = summary.cogs;
const grossProfit = summary.grossProfit;
const operatingExpenses = summary.totalExpenses;
const netProfit = summary.netProfit;

const grossProfitMargin =
  totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

const netProfitMargin =
  totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

const healthScore =
  netProfitMargin >= 20
    ? 'Excellent'
    : netProfitMargin >= 10
      ? 'Good'
      : netProfitMargin > 0
        ? 'Moderate'
        : 'Needs Attention';

res.json({
  success: true,
  data: {
    period: summary.period,
    totalRevenue,
    costOfGoodsSold,
    grossProfit,
    grossProfitMargin: Number(grossProfitMargin.toFixed(1)),
    operatingExpenses,
    netProfit,
    netProfitMargin: Number(netProfitMargin.toFixed(1)),
    healthScore,
    aiInsights: summary.tamilInsights?.length
      ? summary.tamilInsights
      : summary.insights
  }
});
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: 'FINANCIAL_ERROR' });
  }
});

router.get('/pnl', (req: AuthRequest, res: Response) => {
  try {
    const period = (req.query.period as string) || 'this_month';
    const summary = FinancialService.getDashboardSummary(req.businessId!, period);
    res.json({
      success: true,
      data: {
        period: summary.period,
        revenue: summary.totalSales,
        cogs: summary.cogs,
        grossProfit: summary.grossProfit,
        operatingExpenses: summary.totalExpenses,
        netProfit: summary.netProfit,
        profitMargin: summary.profitMargin,
        expenseBreakdown: summary.expenseByCategory
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: 'PNL_ERROR' });
  }
});

export default router;
