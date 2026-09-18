import { db } from '../database/db';
import { Sale, Expense, Product } from '../types';

export interface DateFilterRange {
  startDate: string;
  endDate: string;
  previousStartDate?: string;
  previousEndDate?: string;
}

export class FinancialService {
  public static getDateRange(period: string = 'today', customStart?: string, customEnd?: string): DateFilterRange {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const getDayStr = (d: Date) => d.toISOString().split('T')[0];

    if (period === 'today') {
      const yesterday = new Date(now.getTime() - 86400000);
      return {
        startDate: todayStr,
        endDate: todayStr,
        previousStartDate: getDayStr(yesterday),
        previousEndDate: getDayStr(yesterday),
      };
    } else if (period === 'yesterday') {
      const yesterday = new Date(now.getTime() - 86400000);
      const dayBefore = new Date(now.getTime() - 86400000 * 2);
      return {
        startDate: getDayStr(yesterday),
        endDate: getDayStr(yesterday),
        previousStartDate: getDayStr(dayBefore),
        previousEndDate: getDayStr(dayBefore),
      };
    } else if (period === '7days') {
      const start = new Date(now.getTime() - 7 * 86400000);
      const prevStart = new Date(now.getTime() - 14 * 86400000);
      return {
        startDate: getDayStr(start),
        endDate: todayStr,
        previousStartDate: getDayStr(prevStart),
        previousEndDate: getDayStr(start),
      };
    } else if (period === '30days') {
      const start = new Date(now.getTime() - 30 * 86400000);
      const prevStart = new Date(now.getTime() - 60 * 86400000);
      return {
        startDate: getDayStr(start),
        endDate: todayStr,
        previousStartDate: getDayStr(prevStart),
        previousEndDate: getDayStr(start),
      };
    } else if (period === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: getDayStr(start),
        endDate: todayStr,
        previousStartDate: getDayStr(prevMonthStart),
        previousEndDate: getDayStr(prevMonthEnd),
      };
    } else if (period === 'last_month') {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      const prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const prevEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0);
      return {
        startDate: getDayStr(start),
        endDate: getDayStr(end),
        previousStartDate: getDayStr(prevStart),
        previousEndDate: getDayStr(prevEnd),
      };
    } else {
      return {
        startDate: customStart || todayStr,
        endDate: customEnd || todayStr,
      };
    }
  }

  public static getDashboardSummary(businessId: string, period = 'today', customStart?: string, customEnd?: string) {
    const range = this.getDateRange(period, customStart, customEnd);
    const todayStr = new Date().toISOString().split('T')[0];

    // Current period sales
    const sales = db.sales.filter(s => {
      if (s.businessId !== businessId) return false;
      const sDate = s.createdAt.split('T')[0];
      return sDate >= range.startDate && sDate <= range.endDate;
    });

    // Previous period sales
    const prevSales = range.previousStartDate ? db.sales.filter(s => {
      if (s.businessId !== businessId) return false;
      const sDate = s.createdAt.split('T')[0];
      return sDate >= range.previousStartDate! && sDate <= range.previousEndDate!;
    }) : [];

    // Current purchases
    const purchases = db.purchases.filter(p => {
      if (p.businessId !== businessId) return false;
      const pDate = p.createdAt.split('T')[0];
      return pDate >= range.startDate && pDate <= range.endDate;
    });

    // Current expenses
    const expenses = db.expenses.filter(e => {
      if (e.businessId !== businessId) return false;
      return e.date >= range.startDate && e.date <= range.endDate;
    });

    // Calculations
    const totalSales = sales.reduce((sum, s) => sum + s.netAmount, 0);
    const prevTotalSales = prevSales.reduce((sum, s) => sum + s.netAmount, 0);
    const salesGrowth = prevTotalSales > 0 ? ((totalSales - prevTotalSales) / prevTotalSales) * 100 : 0;

    const totalPurchases = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // COGS
    let cogs = 0;
    sales.forEach(s => {
      s.items.forEach(item => {
        cogs += (item.purchasePrice || 0) * item.quantity;
      });
    });

    const grossProfit = totalSales - cogs;
    const netProfit = grossProfit - totalExpenses;
    const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

    // Debtors & Creditors
    const customers = db.customers.filter(c => c.businessId === businessId);
    const suppliers = db.suppliers.filter(s => s.businessId === businessId);

    const totalReceivables = customers.reduce((sum, c) => sum + (c.outstandingCredit || 0), 0);
    const totalPayables = suppliers.reduce((sum, s) => sum + (s.outstandingPayable || 0), 0);

    // Inventory value
    const products = db.products.filter(p => p.businessId === businessId && p.status !== 'ARCHIVED');
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.currentStock * p.purchasePrice), 0);
    const lowStockProducts = products.filter(p => p.currentStock <= p.minimumStock);

    // Today specific numbers
    const todaySales = db.sales
      .filter(s => s.businessId === businessId && s.createdAt.startsWith(todayStr))
      .reduce((sum, s) => sum + s.netAmount, 0);

    const todayExpenses = db.expenses
      .filter(e => e.businessId === businessId && e.date === todayStr)
      .reduce((sum, e) => sum + e.amount, 0);

    // Top selling products
    const productSalesMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    sales.forEach(s => {
      s.items.forEach(i => {
        const existing = productSalesMap.get(i.productId) || { name: i.productName, quantity: 0, revenue: 0 };
        existing.quantity += i.quantity;
        existing.revenue += i.subtotal;
        productSalesMap.set(i.productId, existing);
      });
    });

    const topSellingProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Top credit customers
    const topDebtors = [...customers]
      .filter(c => c.outstandingCredit > 0)
      .sort((a, b) => b.outstandingCredit - a.outstandingCredit)
      .slice(0, 5);

    // Category-wise expenses
    const expenseByCategory: Record<string, number> = {};
    expenses.forEach(e => {
      expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount;
    });

    // Recent 10 transactions
    const recentTransactions = [
      ...sales.map(s => ({
        id: s.id,
        type: 'SALE',
        title: `விற்பனை: ${s.invoiceNumber}`,
        entity: s.customerName,
        amount: s.netAmount,
        paymentMethod: s.paymentMethod,
        date: s.createdAt,
      })),
      ...purchases.map(p => ({
        id: p.id,
        type: 'PURCHASE',
        title: `கொள்முதல்: ${p.billNumber}`,
        entity: p.supplierName,
        amount: p.totalAmount,
        paymentMethod: p.paymentMethod,
        date: p.createdAt,
      })),
      ...expenses.map(e => ({
        id: e.id,
        type: 'EXPENSE',
        title: `செலவு: ${e.category}`,
        entity: e.description,
        amount: e.amount,
        paymentMethod: e.paymentMethod,
        date: e.createdAt,
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    // Deterministic AI Insight Generator
    const insights: string[] = [];
    const tamilInsights: string[] = [];

    if (totalSales > 0 && salesGrowth > 0) {
      insights.push(`Sales are up ${salesGrowth.toFixed(1)}% compared to the previous period.`);
      tamilInsights.push(`முந்தைய காலத்துடன் ஒப்பிடுகையில் உங்கள் விற்பனை ${salesGrowth.toFixed(1)}% அதிகரித்துள்ளது.`);
    } else if (totalSales > 0 && salesGrowth < 0) {
      insights.push(`Sales decreased by ${Math.abs(salesGrowth).toFixed(1)}% compared to the previous period.`);
      tamilInsights.push(`முந்தைய காலத்துடன் ஒப்பிடுகையில் விற்பனை ${Math.abs(salesGrowth).toFixed(1)}% குறைந்துள்ளது.`);
    }

    if (lowStockProducts.length > 0) {
      const topLow = lowStockProducts[0];
      insights.push(`${lowStockProducts.length} products are below minimum stock (${topLow.name} has only ${topLow.currentStock} left).`);
      tamilInsights.push(`${lowStockProducts.length} பொருட்களின் இருப்பு குறைந்துள்ளது (${topLow.tamilName || topLow.name} இருப்பு வெறும் ${topLow.currentStock} மட்டுமே உள்ளது).`);
    }

    if (totalReceivables > 2000) {
      insights.push(`Customer receivables stand at ₹${totalReceivables.toLocaleString('en-IN')}. Focus on collecting dues from credit customers.`);
      tamilInsights.push(`வாடிக்கையாளர்களிடமிருந்து வசூலிக்க வேண்டிய கடன் ₹${totalReceivables.toLocaleString('en-IN')}-ஆக உள்ளது. நிலுவை வசூலில் கவனம் செலுத்தவும்.`);
    }

    if (topSellingProducts.length > 0) {
      insights.push(`${topSellingProducts[0].name} is your highest grossing product generating ₹${topSellingProducts[0].revenue.toLocaleString('en-IN')}.`);
      tamilInsights.push(`${topSellingProducts[0].name} அதிக வருவாய் ஈட்டித் தரும் முதன்மைப் பொருளாக உள்ளது (₹${topSellingProducts[0].revenue.toLocaleString('en-IN')}).`);
    }

    return {
      period,
      range,
      totalSales,
      prevTotalSales,
      salesGrowth: Number(salesGrowth.toFixed(1)),
      todaySales,
      totalPurchases,
      totalExpenses,
      todayExpenses,
      cogs,
      grossProfit,
      netProfit,
      profitMargin: Number(profitMargin.toFixed(1)),
      totalReceivables,
      totalPayables,
      totalInventoryValue,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.slice(0, 4),
      topSellingProducts,
      topDebtors,
      expenseByCategory,
      recentTransactions,
      insights,
      tamilInsights
    };
  }

  public static getFinancialTrend(businessId: string, days = 7) {
    const trend = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

      const daySales = db.sales
        .filter(s => s.businessId === businessId && s.createdAt.startsWith(dateStr))
        .reduce((sum, s) => sum + s.netAmount, 0);

      const dayExpenses = db.expenses
        .filter(e => e.businessId === businessId && e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);

      const dayPurchases = db.purchases
        .filter(p => p.businessId === businessId && p.createdAt.startsWith(dateStr))
        .reduce((sum, p) => sum + p.totalAmount, 0);

      trend.push({
        date: dateStr,
        label: dayLabel,
        sales: daySales,
        expenses: dayExpenses,
        purchases: dayPurchases,
        net: daySales - dayExpenses
      });
    }

    return trend;
  }
}
