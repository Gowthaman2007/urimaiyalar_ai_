import { Router, Response } from 'express';
import { authMiddleware, requireBusiness, AuthRequest } from '../middleware/auth';
import { InventoryService } from '../services/inventoryService';

const router = Router();
router.use(authMiddleware, requireBusiness);

// Inventory overview & stock value
router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const summary = InventoryService.getInventorySummary(req.businessId!);
    const products = InventoryService.getProducts(req.businessId!);
    res.json({
      success: true,
      data: {
        summary,
        products
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: 'INVENTORY_ERROR' });
  }
});

// Low stock products
router.get('/low-stock', (req: AuthRequest, res: Response) => {
  try {
    const lowStock = InventoryService.getLowStockProducts(req.businessId!);
    res.json({
      success: true,
      data: lowStock
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: 'LOW_STOCK_ERROR' });
  }
});

// Adjust stock
router.post('/adjust', async (req: AuthRequest, res: Response) => {
  try {
    const { productId, newStock, type, reason } = req.body;
    if (!productId || newStock === undefined || !type) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, new stock level, and adjustment type are required.',
        code: 'VALIDATION_ERROR'
      });
    }

    const updated = await InventoryService.adjustStock(
      req.businessId!,
      productId,
      Number(newStock),
      type,
      reason || 'Manual inventory adjustment'
    );

    res.json({
      success: true,
      data: updated
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, code: 'ADJUSTMENT_ERROR' });
  }
});

// Stock transaction history
router.get('/transactions', (req: AuthRequest, res: Response) => {
  try {
    const productId = req.query.productId as string;
    const txs = InventoryService.getStockTransactions(req.businessId!, productId);
    res.json({
      success: true,
      data: txs
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: 'TRANSACTIONS_ERROR' });
  }
});

export default router;
