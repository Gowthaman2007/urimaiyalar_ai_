import { db } from '../database/db';
import { FinancialService } from '../services/financialService';
import { InventoryService } from '../services/inventoryService';
import { CreditService } from '../services/creditService';
import { ExpenseService } from '../services/expenseService';
import { memoryService } from '../services/memoryService';

export class BusinessTools {
  public static async getSalesSummary(businessId: string, period = 'today') {
    const summary = FinancialService.getDashboardSummary(businessId, period);
    return {
      period,
      totalSales: summary.totalSales,
      salesGrowth: summary.salesGrowth,
      previousPeriodSales: summary.prevTotalSales,
      transactionsCount: summary.recentTransactions.filter(t => t.type === 'SALE').length,
      topSelling: summary.topSellingProducts.slice(0, 3),
      todaySales: summary.todaySales
    };
  }

  public static async getLowStock(businessId: string) {
    const lowStock = InventoryService.getLowStockProducts(businessId);
    return {
      count: lowStock.length,
      items: lowStock.map(p => ({
        id: p.id,
        name: p.name,
        tamilName: p.tamilName,
        currentStock: p.currentStock,
        minimumStock: p.minimumStock,
        unit: p.unit,
        supplier: p.supplierName
      }))
    };
  }

  public static async getCustomerCredit(businessId: string, customerNameQuery: string) {
    const q = customerNameQuery.toLowerCase().trim();
    const customers = db.customers.filter(c => c.businessId === businessId);

    const matches = customers.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.phone.includes(q)
    );

    if (matches.length === 0) {
      return {
        found: false,
        query: customerNameQuery,
        message: `No customer record found matching "${customerNameQuery}".`
      };
    }

    const customer = matches[0];
    const recentTx = db.creditTransactions
      .filter(t => t.businessId === businessId && t.entityId === customer.id)
      .slice(0, 5);

    return {
      found: true,
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      outstandingCredit: customer.outstandingCredit,
      totalPurchases: customer.totalPurchases,
      totalPaid: customer.totalPaid,
      recentTransactions: recentTx.map(t => ({
        type: t.type,
        amount: t.amount,
        balanceAfter: t.balanceAfter,
        date: t.createdAt,
        notes: t.notes
      }))
    };
  }

  public static async addCustomerCredit(businessId: string, customerNameQuery: string, amount: number, notes?: string) {
    const q = customerNameQuery.toLowerCase().trim();
    let customer = db.customers.find(c => c.businessId === businessId && (c.name.toLowerCase().includes(q) || c.phone.includes(q)));
    
    if (!customer) {
      // Create customer automatically if new
      customer = {
        id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        businessId,
        name: customerNameQuery,
        phone: '',
        totalPurchases: 0,
        totalPaid: 0,
        outstandingCredit: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.saveCustomer(customer);
    }

    const tx = await CreditService.addCredit(businessId, customer.id, amount, notes);
    return {
      success: true,
      customerName: customer.name,
      amountAdded: amount,
      newTotalCredit: customer.outstandingCredit,
      transactionId: tx.id
    };
  }

  public static async recordCustomerPayment(businessId: string, customerNameQuery: string, amount: number, method: 'CASH' | 'UPI' | 'BANK_TRANSFER' = 'CASH') {
    const q = customerNameQuery.toLowerCase().trim();
    const customer = db.customers.find(c => c.businessId === businessId && (c.name.toLowerCase().includes(q) || c.phone.includes(q)));
    
    if (!customer) {
      return {
        success: false,
        message: `Customer "${customerNameQuery}" not found.`
      };
    }

    const tx = await CreditService.recordPayment({
      businessId,
      entityType: 'CUSTOMER',
      entityId: customer.id,
      amount,
      paymentMethod: method,
      notes: 'Recorded via AI Assistant'
    });

    return {
      success: true,
      customerName: customer.name,
      amountPaid: amount,
      remainingBalance: customer.outstandingCredit,
      transactionId: tx.id
    };
  }

  public static async getExpenses(businessId: string, period = 'today') {
    const summary = FinancialService.getDashboardSummary(businessId, period);
    return {
      period,
      totalExpenses: summary.totalExpenses,
      byCategory: summary.expenseByCategory,
      todayExpenses: summary.todayExpenses
    };
  }

  public static async getProfit(businessId: string, period = 'today') {
    const summary = FinancialService.getDashboardSummary(businessId, period);
    return {
      period,
      revenue: summary.totalSales,
      cogs: summary.cogs,
      grossProfit: summary.grossProfit,
      expenses: summary.totalExpenses,
      netProfit: summary.netProfit,
      profitMargin: summary.profitMargin
    };
  }

  public static async getBusinessSummary(businessId: string) {
    const summary = FinancialService.getDashboardSummary(businessId, 'today');
    const ledger = CreditService.getLedgerSummary(businessId);
    return {
      todaySales: summary.todaySales,
      todayExpenses: summary.todayExpenses,
      todayNet: summary.todaySales - summary.todayExpenses,
      totalReceivables: ledger.totalReceivable,
      totalPayables: ledger.totalPayable,
      inventoryValue: summary.totalInventoryValue,
      lowStockCount: summary.lowStockCount,
      insights: summary.insights,
      tamilInsights: summary.tamilInsights
    };
  }

  public static async searchBusinessMemory(businessId: string, query: string) {
    const results = await memoryService.searchMemory(query, businessId, { limit: 5 });
    return {
      query,
      resultsCount: results.length,
      memories: results.map(m => ({
        type: m.type,
        title: m.title,
        content: m.content,
        tamilContent: m.tamilContent,
        importance: m.importance,
        createdAt: m.createdAt
      }))
    };
  }

  public static async searchGovernmentSchemes(query: string, category?: string) {
    const q = query.toLowerCase().trim();
    let schemes = db.governmentSchemes.filter(s => s.active);

    if (category) {
      schemes = schemes.filter(s => s.businessCategory.some(c => c.toLowerCase().includes(category.toLowerCase())));
    }

    if (q) {
      schemes = schemes.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.tamilName.toLowerCase().includes(q) || 
        s.eligibility.toLowerCase().includes(q) || 
        s.eligibilityTamil.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
      );
    }

    return {
      query,
      foundCount: schemes.length,
      schemes: schemes.map(s => ({
        id: s.id,
        code: s.code,
        name: s.name,
        tamilName: s.tamilName,
        agency: s.agency,
        subsidyOrLoan: s.subsidyOrLoan,
        maxAmount: s.maxAmount,
        eligibilityTamil: s.eligibilityTamil,
        requiredDocuments: s.requiredDocuments,
        portalUrl: s.portalUrl
      }))
    };
  }
}
