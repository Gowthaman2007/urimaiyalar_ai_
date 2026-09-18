import { Router, Response } from 'express';
import { authMiddleware, requireBusiness, AuthRequest } from '../middleware/auth';
import { PurchaseService } from '../services/purchaseService';

const router = Router();
router.use(authMiddleware, requireBusiness);

router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const offset = parseInt(req.query.offset as string, 10) || 0;
    const result = PurchaseService.getPurchases(req.businessId!, limit, offset);
    res.json({
      success: true,
      data: result.purchases,
      total: result.total
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: 'PURCHASE_FETCH_ERROR' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { billNumber, supplierId, supplierName, supplierPhone, items, paidAmount, creditAmount, paymentMethod, notes } = req.body;

    if (!billNumber || !supplierName || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Bill number, supplier name, and purchase items are required.',
        code: 'VALIDATION_ERROR'
      });
    }

    const purchase = await PurchaseService.createPurchase({
      businessId: req.businessId!,
      billNumber,
      supplierId,
      supplierName,
      supplierPhone,
      items,
      paidAmount: Number(paidAmount || 0),
      creditAmount: Number(creditAmount || 0),
      paymentMethod: paymentMethod || 'CASH',
      notes
    });

    res.status(201).json({
      success: true,
      data: purchase
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, code: 'PURCHASE_CREATION_FAILED' });
  }
});

export default router;
