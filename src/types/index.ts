/**
 * URIMAIYALAR AI - Frontend TypeScript Definitions
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'CASHIER';
  phone?: string;
}

export interface Business {
  id: string;
  userId: string;
  businessName: string;
  name?: string; // alias
  ownerName: string;
  businessType: string;
  category: string;
  phone: string;
  email?: string;
  address: string;
  district: string;
  city?: string; // alias
  state: string;
  preferredLanguage: 'ta' | 'en' | 'tanglish';
  currency: string;
  gstin?: string;
  isDemo?: boolean;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  tamilName?: string;
  sku: string;
  category: string;
  unit: string;
  sellingPrice: number;
  purchasePrice: number;
  currentStock: number;
  minimumStock: number;
  supplierName?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  purchasePrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  businessId: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  netAmount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CREDIT' | 'SPLIT' | 'CARD';
  paidAmount: number;
  creditAmount: number;
  notes?: string;
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  businessId: string;
  billNumber: string;
  supplierId?: string;
  supplierName: string;
  supplierPhone?: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  creditAmount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CREDIT' | 'BANK_TRANSFER';
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  totalPurchases: number;
  totalPaid: number;
  outstandingCredit: number;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  totalPurchases: number;
  totalPaid: number;
  outstandingPayable: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreditTransaction {
  id: string;
  businessId: string;
  entityType: 'CUSTOMER' | 'SUPPLIER';
  entityId: string;
  entityName: string;
  type: 'CREDIT_GIVEN' | 'PAYMENT_RECEIVED' | 'PURCHASE_ON_CREDIT' | 'SUPPLIER_PAYMENT';
  amount: number;
  balanceAfter: number;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  businessId: string;
  category: 'RENT' | 'ELECTRICITY' | 'TRANSPORT' | 'SALARY' | 'PURCHASE_RELATED' | 'MAINTENANCE' | 'MARKETING' | 'OTHER';
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'BANK_TRANSFER';
  description: string;
  date: string;
  createdAt: string;
}

export interface BusinessMemory {
  id: string;
  businessId?: string;
  type?: 'FACT' | 'EVENT' | 'PREFERENCE' | 'INSIGHT' | 'CONVERSATION_SUMMARY';
  category?: string;
  title: string;
  content: string;
  tamilContent?: string;
  source?: string;
  importance?: number | 'LOW' | 'MEDIUM' | 'HIGH';
  isPinned?: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
}

export type BusinessMemoryItem = BusinessMemory;

export interface Alert {
  id: string;
  businessId: string;
  type: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  message: string;
  tamilMessage?: string;
  isRead: boolean;
  isResolved?: boolean;
  link?: string;
  createdAt: string;
}

export type BusinessAlert = Alert;

export interface GovernmentScheme {
  id: string;
  name: string;
  tamilName: string;
  code?: string;
  agency: string;
  businessCategory?: string[];
  description?: string;
  descriptionTamil?: string;
  eligibility: string[] | string;
  eligibilityTamil?: string;
  subsidyOrLoan?: string;
  subsidyPercentage?: string | number;
  maxAmount?: string;
  maxLoanAmount?: string;
  interestRate?: string;
  requiredDocuments?: string[];
  documentsRequired?: string[];
  applicationProcess?: string;
  portalUrl?: string;
  applicationUrl?: string;
  lastUpdated?: string;
  active?: boolean;
}

export interface MarketIndicator {
  id: string;
  commodity: string;
  tamilName: string;
  marketLocation: string;
  unit: string;
  currentPrice: number;
  previousPrice: number;
  changePercentage: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  demandLevel: 'HIGH' | 'MODERATE' | 'LOW';
  updatedAt: string;
  notes: string;
}

export interface MarketPrice {
  id: string;
  commodity: string;
  tamilName: string;
  market: string;
  variety?: string;
  unit: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  date: string;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  sender: 'USER' | 'ASSISTANT';
  text: string;
  intent?: string;
  toolCalls?: Array<{
    tool: string;
    input?: any;
    output?: any;
  }>;
  dataInsight?: {
    type: string;
    keyMetric?: string;
    value?: string | number;
    trend?: string;
    recommendation?: string;
    actionItems?: string[];
  };
  createdAt: string;
}

export interface FinancialSummary {
  period: string;
  totalRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  grossProfitMargin: number;
  operatingExpenses: number;
  netProfit: number;
  netProfitMargin: number;
  healthScore: string;
  aiInsights: string[];
}

export interface DashboardSummary {
  period: string;
  totalSales: number;
  prevTotalSales: number;
  salesGrowth: number;
  todaySales: number;
  totalPurchases: number;
  totalExpenses: number;
  todayExpenses: number;
  cogs: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  totalReceivables: number;
  totalPayables: number;
  totalInventoryValue: number;
  lowStockCount: number;
  lowStockProducts: Product[];
  topSellingProducts: Array<{ name: string; quantity: number; revenue: number }>;
  topDebtors: Customer[];
  expenseByCategory: Record<string, number>;
  recentTransactions: Array<{
    id: string;
    type: string;
    title: string;
    entity: string;
    amount: number;
    paymentMethod: string;
    date: string;
  }>;
  insights: string[];
  tamilInsights: string[];
}
