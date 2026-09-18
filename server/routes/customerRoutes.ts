import { Router, Response } from 'express';
import { authMiddleware, requireBusiness, AuthRequest } from '../middleware/auth';
import { db } from '../database/db';
import { Customer } from '../types';

const router = Router();
router.use(authMiddleware, requireBusiness);

// List customers
router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const customers = db.customers.filter(c => c.businessId === req.businessId!);
    res.json({
      success: true,
      data: customers
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: 'CUSTOMER_ERROR' });
  }
});

// Customer detail with sales and credit timeline
router.get('/:id', (req: AuthRequest, res: Response) => {
  try {
    const customer = db.customers.find(c => c.id === req.params.id && c.businessId === req.businessId!);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.', code: 'NOT_FOUND' });
    }

    const sales = db.sales.filter(s => s.customerId === customer.id && s.businessId === req.businessId!);
    const creditTxs = db.creditTransactions.filter(t => t.entityId === customer.id && t.businessId === req.businessId!);

    res.json({
      success: true,
      data: {
        customer,
        sales,
        creditTransactions: creditTxs
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: 'CUSTOMER_DETAIL_ERROR' });
  }
});

// Create customer
router.post('/', (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, address, notes } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Customer name is required.', code: 'VALIDATION_ERROR' });
    }

    const now = new Date().toISOString();
    const customer: Customer = {
      id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      businessId: req.businessId!,
      name,
      phone: phone || '',
      address: address || '',
      notes: notes || '',
      totalPurchases: 0,
      totalPaid: 0,
      outstandingCredit: 0,
      createdAt: now,
      updatedAt: now
    };

    db.saveCustomer(customer);
    res.status(201).json({ success: true, data: customer });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, code: 'CUSTOMER_CREATE_ERROR' });
  }
});

export default router;
