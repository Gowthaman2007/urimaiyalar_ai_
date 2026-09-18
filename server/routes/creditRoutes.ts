import { Router, Response } from 'express';
import { authMiddleware, requireBusiness, AuthRequest } from '../middleware/auth';
import { CreditService } from '../services/creditService';
import { db } from '../database/db';

const router = Router();
router.use(authMiddleware, requireBusiness);

// Credit ledger summary
router.get('/summary', (req: AuthRequest, res: Response) => {
  try {
    const summary = CreditService.getLedgerSummary(req.businessId!);
    const customers = db.customers.filter(c => c.businessId === req.businessId! && c.outstandingCredit > 0);
    const suppliers = db.suppliers.filter(s => s.businessId === req.businessId! && s.outstandingPayable > 0);

    res.json({
      success: true,
      data: {
        summary,
        customersWithDue: customers,
        suppliersWithDue: suppliers
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: 'CREDIT_ERROR' });
  }
});

// Credit transactions history
router.get('/transactions', (req: AuthRequest, res: Response) => {
  try {
    const entityId = req.query.entityId as string;
    const txs = CreditService.getTransactions(req.businessId!, entityId);
    res.json({
      success: true,
      data: txs
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: 'CREDIT_TX_ERROR' });
  }
});

// Record payment settlement
router.post('/payment', async (req: AuthRequest, res: Response) => {
  try {
    const { entityType, entityId, amount, paymentMethod, notes } = req.body;
    if (!entityType || !entityId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Entity type, ID, and payment amount are required.',
        code: 'VALIDATION_ERROR'
      });
    }

    const tx = await CreditService.recordPayment({
      businessId: req.businessId!,
      entityType,
      entityId,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'CASH',
      notes
    });

    res.json({
      success: true,
      data: tx
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, code: 'PAYMENT_RECORD_ERROR' });
  }
});

// Add credit manually
router.post('/add', async (req: AuthRequest, res: Response) => {
  try {
    const { customerId, amount, notes } = req.body;
    if (!customerId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID and amount are required.',
        code: 'VALIDATION_ERROR'
      });
    }

    const tx = await CreditService.addCredit(req.businessId!, customerId, Number(amount), notes);
    res.json({
      success: true,
      data: tx
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message, code: 'ADD_CREDIT_ERROR' });
  }
});

export default router;
