import { Router, Response } from 'express';
import { authMiddleware, requireBusiness, AuthRequest } from '../middleware/auth';
import { SalesService } from '../services/salesService';

const router = Router();
router.use(authMiddleware, requireBusiness);

// Get sales history
router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const result = SalesService.getSales(req.businessId!, limit, offset);
    res.json({
      success: true,
      data: result.sales,
      total: result.total
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: 'SALES_FETCH_ERROR' });
  }
});

// Create atomic sale
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { customerId, customerName, customerPhone, items, discountAmount, taxAmount, paymentMethod, paidAmount, creditAmount, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one sale item is required.',
        code: 'VALIDATION_ERROR'
      });
    }

    const sale = await SalesService.createSale({
      businessId: req.businessId!,
      customerId,
      customerName: customerName || 'Cash Customer',
      customerPhone,
      items,
      discountAmount: Number(discountAmount || 0),
      taxAmount: Number(taxAmount || 0),
      paymentMethod: paymentMethod || 'CASH',
      paidAmount: Number(paidAmount || 0),
      creditAmount: Number(creditAmount || 0),
      notes
    });

    res.status(201).json({
      success: true,
      data: sale
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, code: 'SALE_CREATION_FAILED' });
  }
});

export default router;
