import { Router, Response } from 'express';
import { authMiddleware, requireBusiness, AuthRequest } from '../middleware/auth';
import { db } from '../database/db';
import { Supplier } from '../types';

const router = Router();
router.use(authMiddleware, requireBusiness);

router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const suppliers = db.suppliers.filter(s => s.businessId === req.businessId!);
    res.json({
      success: true,
      data: suppliers
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: 'SUPPLIER_ERROR' });
  }
});

router.post('/', (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, address, notes } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Supplier name is required.', code: 'VALIDATION_ERROR' });
    }

    const now = new Date().toISOString();
    const supplier: Supplier = {
      id: `supp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      businessId: req.businessId!,
      name,
      phone: phone || '',
      address: address || '',
      notes: notes || '',
      totalPurchases: 0,
      totalPaid: 0,
      outstandingPayable: 0,
      createdAt: now,
      updatedAt: now
    };

    db.saveSupplier(supplier);
    res.status(201).json({ success: true, data: supplier });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, code: 'SUPPLIER_CREATE_ERROR' });
  }
});

export default router;
