import { Router, Response } from 'express';
import { authMiddleware, requireBusiness, AuthRequest } from '../middleware/auth';
import { ExpenseService } from '../services/expenseService';

const router = Router();
router.use(authMiddleware, requireBusiness);

router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const category = req.query.category as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const expenses = ExpenseService.getExpenses(req.businessId!, category, startDate, endDate);
    res.json({
      success: true,
      data: expenses
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: 'EXPENSE_FETCH_ERROR' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { category, amount, paymentMethod, description, date } = req.body;
    if (!category || !amount || !description) {
      return res.status(400).json({
        success: false,
        message: 'Category, amount, and description are required.',
        code: 'VALIDATION_ERROR'
      });
    }

    const expense = await ExpenseService.createExpense({
      businessId: req.businessId!,
      category,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'CASH',
      description,
      date
    });

    res.status(201).json({
      success: true,
      data: expense
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, code: 'EXPENSE_CREATE_ERROR' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await ExpenseService.deleteExpense(req.businessId!, req.params.id);
    res.json({ success: true, deleted });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, code: 'EXPENSE_DELETE_ERROR' });
  }
});

export default router;
