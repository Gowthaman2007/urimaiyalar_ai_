/**
 * URIMAIYALAR AI - Core Domain Types
 */

export type UserRole = 'OWNER' | 'MANAGER' | 'CASHIER';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: string;
  userId: string;
  businessName: string;
  ownerName: string;
  businessType: string;
  category: string;
  phone: string;
  email?: string;
  address: string;
  district: string;
  state: string;
  preferredLanguage: 'ta' | 'en' | 'tanglish';
  currency: string;
  gstin?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  businessId: string;
  name: string;
  tamilName?: string;
  color?: string;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  tamilName?: string;
  sku: string;
  category: string;
  unit: string; // 'kg', 'litre', 'piece', 'packet', 'box', 'bag'
  sellingPrice: number;
  purchasePrice: number;
  currentStock: number;
  minimumStock: number;
  supplierId?: string;
  supplierName?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export type InventoryTransactionType = 'SALE' | 'PURCHASE' | 'RETURN' | 'ADJUSTMENT' | 'DAMAGE';

export interface InventoryTransaction {
  id: string;
  businessId: string;
  productId: string;
  productName: string;
  type: InventoryTransactionType;
  quantityChange: number; // positive or negative
  previousStock: number;
  newStock: number;
  reason?: string;
  referenceId?: string;
  createdAt: string;
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

export type CreditTransactionType = 'CREDIT_GIVEN' | 'PAYMENT_RECEIVED' | 'PURCHASE_ON_CREDIT' | 'SUPPLIER_PAYMENT';

export interface CreditTransaction {
  id: string;
  businessId: string;
  entityType: 'CUSTOMER' | 'SUPPLIER';
  entityId: string;
  entityName: string;
  type: CreditTransactionType;
  amount: number;
  balanceAfter: number;
  paymentMethod?: string;
  notes?: string;
  referenceSaleId?: string;
  referencePurchaseId?: string;
  createdAt: string;
}

export type ExpenseCategory = 
  | 'RENT'
  | 'ELECTRICITY'
  | 'TRANSPORT'
  | 'SALARY'
  | 'PURCHASE_RELATED'
  | 'MAINTENANCE'
  | 'MARKETING'
  | 'PACKAGING'
  | 'OTHER';

export interface Expense {
  id: string;
  businessId: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'BANK_TRANSFER';
  description: string;
  date: string;
  createdAt: string;
}

export type MemoryType = 'FACT' | 'EVENT' | 'PREFERENCE' | 'INSIGHT' | 'CONVERSATION_SUMMARY';

export interface BusinessMemory {
  id: string;
  businessId: string;
  type: MemoryType;
  title: string;
  content: string;
  tamilContent?: string;
  source: 'SALES_ENGINE' | 'AI_ASSISTANT' | 'USER_NOTE' | 'FINANCIAL_INSIGHT' | 'INVENTORY_SCAN';
  importance: 'LOW' | 'MEDIUM' | 'HIGH';
  metadata?: Record<string, any>;
  createdAt: string;
}

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertType = 'LOW_STOCK' | 'CREDIT_OVERDUE' | 'HIGH_EXPENSE' | 'SALES_DROP' | 'SUPPLIER_DUE' | 'OPPORTUNITY';

export interface Alert {
  id: string;
  businessId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  tamilMessage?: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  tamilName: string;
  code: string;
  agency: 'TAMIL_NADU_GOVT' | 'CENTRAL_GOVT' | 'NABARD' | 'SIDBI';
  businessCategory: string[];
  eligibility: string;
  eligibilityTamil: string;
  subsidyOrLoan: string;
  subsidyPercentage?: string;
  maxAmount: string;
  requiredDocuments: string[];
  applicationProcess: string;
  portalUrl: string;
  lastUpdated: string;
  active: boolean;
}

export interface MarketIndicator {
  id: string;
  commodity: string;
  tamilName: string;
  marketLocation: string; // e.g. Koyambedu, Madurai, Erode
  unit: string;
  currentPrice: number;
  previousPrice: number;
  changePercentage: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  demandLevel: 'HIGH' | 'MODERATE' | 'LOW';
  updatedAt: string;
  notes: string;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  sender: 'USER' | 'ASSISTANT';
  text: string;
  intent?: string;
  toolCalls?: Array<{
    tool: string;
    input: any;
    output: any;
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

export interface AIConversation {
  id: string;
  businessId: string;
  userId: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}
