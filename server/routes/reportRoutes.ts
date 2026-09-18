import { Router, Response } from 'express';
import { authMiddleware, requireBusiness, AuthRequest } from '../middleware/auth';
import { db } from '../database/db';

const router = Router();
router.use(authMiddleware, requireBusiness);

router.get('/data', (req: AuthRequest, res: Response) => {
  try {
    const type = (req.query.type as string) || 'sales';
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const bizId = req.businessId!;

    if (type === 'sales') {
      let sales = db.sales.filter(s => s.businessId === bizId);
      if (startDate) sales = sales.filter(s => s.createdAt.split('T')[0] >= startDate);
      if (endDate) sales = sales.filter(s => s.createdAt.split('T')[0] <= endDate);

      return res.json({ success: true, data: sales });
    }

    if (type === 'inventory') {
      const products = db.products.filter(p => p.businessId === bizId);
      return res.json({ success: true, data: products });
    }

    if (type === 'expenses') {
      let expenses = db.expenses.filter(e => e.businessId === bizId);
      if (startDate) expenses = expenses.filter(e => e.date >= startDate);
      if (endDate) expenses = expenses.filter(e => e.date <= endDate);

      return res.json({ success: true, data: expenses });
    }

    if (type === 'credit') {
      const customers = db.customers.filter(c => c.businessId === bizId && c.outstandingCredit > 0);
      return res.json({ success: true, data: customers });
    }

    res.status(400).json({ success: false, message: 'Invalid report type.', code: 'INVALID_TYPE' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: 'REPORT_ERROR' });
  }
});

// CSV Export format generator
router.get('/csv', (req: AuthRequest, res: Response) => {
  try {
    const type = (req.query.type as string) || 'sales';
    const bizId = req.businessId!;

    let csvContent = '';
    let filename = `urimaiyalar_${type}_${new Date().toISOString().split('T')[0]}.csv`;

    if (type === 'sales') {
      csvContent = 'Invoice,Date,Customer,PaymentMethod,ItemsCount,TotalAmount,Discount,Tax,NetAmount,Paid,Credit\n';
      const sales = db.sales.filter(s => s.businessId === bizId);
      sales.forEach(s => {
        csvContent += `"${s.invoiceNumber}","${s.createdAt.split('T')[0]}","${s.customerName}","${s.paymentMethod}",${s.items.length},${s.totalAmount},${s.discountAmount},${s.taxAmount},${s.netAmount},${s.paidAmount},${s.creditAmount}\n`;
      });
    } else if (type === 'inventory') {
      csvContent = 'Name,TamilName,SKU,Category,Unit,CurrentStock,MinStock,PurchasePrice,SellingPrice,StockValue\n';
      const products = db.products.filter(p => p.businessId === bizId);
      products.forEach(p => {
        csvContent += `"${p.name}","${p.tamilName || ''}","${p.sku}","${p.category}","${p.unit}",${p.currentStock},${p.minimumStock},${p.purchasePrice},${p.sellingPrice},${p.currentStock * p.purchasePrice}\n`;
      });
    } else if (type === 'expenses') {
      csvContent = 'Date,Category,Amount,PaymentMethod,Description\n';
      const expenses = db.expenses.filter(e => e.businessId === bizId);
      expenses.forEach(e => {
        csvContent += `"${e.date}","${e.category}",${e.amount},"${e.paymentMethod}","${e.description.replace(/"/g, '""')}"\n`;
      });
    } else if (type === 'credit') {
      csvContent = 'CustomerName,Phone,OutstandingCredit,TotalPurchases,TotalPaid\n';
      const customers = db.customers.filter(c => c.businessId === bizId);
      customers.forEach(c => {
        csvContent += `"${c.name}","${c.phone}",${c.outstandingCredit},${c.totalPurchases},${c.totalPaid}\n`;
      });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, code: 'CSV_EXPORT_ERROR' });
  }
});

export default router;
