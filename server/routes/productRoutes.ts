import { Router, Response } from 'express';
import { authMiddleware, requireBusiness, AuthRequest } from '../middleware/auth';
import { InventoryService } from '../services/inventoryService';

const router = Router();
router.use(authMiddleware, requireBusiness);

// Get products list
router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const search = req.query.search as string;
    const category = req.query.category as string;
    const products = InventoryService.getProducts(req.businessId!, search, category);
    res.json({
      success: true,
      data: products
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: 'PRODUCT_FETCH_ERROR' });
  }
});

// Create product
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { name, tamilName, sku, category, unit, sellingPrice, purchasePrice, currentStock, minimumStock, supplierName } = req.body;
    if (!name || !sku || sellingPrice === undefined || purchasePrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product name, SKU, selling price, and purchase price are required.',
        code: 'VALIDATION_ERROR'
      });
    }

    const product = await InventoryService.createProduct(req.businessId!, {
      name,
      tamilName,
      sku,
      category: category || 'General',
      unit: unit || 'piece',
      sellingPrice: Number(sellingPrice),
      purchasePrice: Number(purchasePrice),
      currentStock: Number(currentStock || 0),
      minimumStock: Number(minimumStock || 5),
      supplierName,
      status: 'ACTIVE'
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, code: 'PRODUCT_CREATE_ERROR' });
  }
});

// Update product
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const product = await InventoryService.updateProduct(req.businessId!, req.params.id, req.body);
    res.json({
      success: true,
      data: product
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, code: 'PRODUCT_UPDATE_ERROR' });
  }
});

export default router;
