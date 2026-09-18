import fs from 'fs';
import path from 'path';
import {
  User,
  Business,
  Product,
  Category,
  Customer,
  Supplier,
  Sale,
  Purchase,
  CreditTransaction,
  Expense,
  InventoryTransaction,
  BusinessMemory,
  Alert,
  GovernmentScheme,
  MarketIndicator,
  AIConversation,
} from '../types';

export interface DatabaseSchema {
  users: User[];
  businesses: Business[];
  products: Product[];
  categories: Category[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  purchases: Purchase[];
  creditTransactions: CreditTransaction[];
  expenses: Expense[];
  inventoryTransactions: InventoryTransaction[];
  businessMemories: BusinessMemory[];
  alerts: Alert[];
  governmentSchemes: GovernmentScheme[];
  marketIndicators: MarketIndicator[];
  aiConversations: AIConversation[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'urimaiyalar.db.json');

class DatabaseService {
  private data: DatabaseSchema;
  private inTransaction: boolean = false;
  private transactionSnapshot: string | null = null;

  constructor() {
    this.data = this.createEmptySchema();
    this.init();
  }

  private createEmptySchema(): DatabaseSchema {
    return {
      users: [],
      businesses: [],
      products: [],
      categories: [],
      customers: [],
      suppliers: [],
      sales: [],
      purchases: [],
      creditTransactions: [],
      expenses: [],
      inventoryTransactions: [],
      businessMemories: [],
      alerts: [],
      governmentSchemes: [],
      marketIndicators: [],
      aiConversations: [],
    };
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          ...this.createEmptySchema(),
          ...parsed,
        };
      } else {
        this.data = this.createEmptySchema();
        this.persist();
      }
    } catch (err) {
      console.error('Error initializing database file:', err);
      this.data = this.createEmptySchema();
    }
  }

  public persist() {
    if (this.inTransaction) return; // Wait until transaction commits
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  /**
   * ACID Transaction Support with Atomic Rollback
   */
  public async runTransaction<T>(callback: () => Promise<T>): Promise<T> {
    if (this.inTransaction) {
      // Nested transaction: proceed in same context
      return await callback();
    }

    this.inTransaction = true;
    this.transactionSnapshot = JSON.stringify(this.data);

    try {
      const result = await callback();
      this.inTransaction = false;
      this.transactionSnapshot = null;
      this.persist();
      return result;
    } catch (error) {
      // Atomic rollback to previous state
      if (this.transactionSnapshot) {
        this.data = JSON.parse(this.transactionSnapshot);
      }
      this.inTransaction = false;
      this.transactionSnapshot = null;
      console.error('Transaction failed & rolled back safely:', error);
      throw error;
    }
  }

  // --- Users & Business Scoping ---
  get users(): User[] { return this.data.users; }
  get businesses(): Business[] { return this.data.businesses; }
  get products(): Product[] { return this.data.products; }
  get categories(): Category[] { return this.data.categories; }
  get customers(): Customer[] { return this.data.customers; }
  get suppliers(): Supplier[] { return this.data.suppliers; }
  get sales(): Sale[] { return this.data.sales; }
  get purchases(): Purchase[] { return this.data.purchases; }
  get creditTransactions(): CreditTransaction[] { return this.data.creditTransactions; }
  get expenses(): Expense[] { return this.data.expenses; }
  get inventoryTransactions(): InventoryTransaction[] { return this.data.inventoryTransactions; }
  get businessMemories(): BusinessMemory[] { return this.data.businessMemories; }
  get alerts(): Alert[] { return this.data.alerts; }
  get governmentSchemes(): GovernmentScheme[] { return this.data.governmentSchemes; }
  get marketIndicators(): MarketIndicator[] { return this.data.marketIndicators; }
  get aiConversations(): AIConversation[] { return this.data.aiConversations; }

  // Helpers for direct entity operations
  public saveUser(user: User) {
    const idx = this.data.users.findIndex(u => u.id === user.id);
    if (idx >= 0) this.data.users[idx] = user;
    else this.data.users.push(user);
    this.persist();
  }

  public saveBusiness(business: Business) {
    const idx = this.data.businesses.findIndex(b => b.id === business.id);
    if (idx >= 0) this.data.businesses[idx] = business;
    else this.data.businesses.push(business);
    this.persist();
  }

  public saveProduct(product: Product) {
    const idx = this.data.products.findIndex(p => p.id === product.id);
    if (idx >= 0) this.data.products[idx] = product;
    else this.data.products.push(product);
    this.persist();
  }

  public deleteProduct(id: string, businessId: string) {
    this.data.products = this.data.products.filter(p => !(p.id === id && p.businessId === businessId));
    this.persist();
  }

  public saveCustomer(customer: Customer) {
    const idx = this.data.customers.findIndex(c => c.id === customer.id);
    if (idx >= 0) this.data.customers[idx] = customer;
    else this.data.customers.push(customer);
    this.persist();
  }

  public saveSupplier(supplier: Supplier) {
    const idx = this.data.suppliers.findIndex(s => s.id === supplier.id);
    if (idx >= 0) this.data.suppliers[idx] = supplier;
    else this.data.suppliers.push(supplier);
    this.persist();
  }

  public saveSale(sale: Sale) {
    this.data.sales.unshift(sale);
    this.persist();
  }

  public savePurchase(purchase: Purchase) {
    this.data.purchases.unshift(purchase);
    this.persist();
  }

  public saveCreditTransaction(tx: CreditTransaction) {
    this.data.creditTransactions.unshift(tx);
    this.persist();
  }

  public saveExpense(expense: Expense) {
    this.data.expenses.unshift(expense);
    this.persist();
  }

  public saveInventoryTransaction(tx: InventoryTransaction) {
    this.data.inventoryTransactions.unshift(tx);
    this.persist();
  }

  public saveBusinessMemory(mem: BusinessMemory) {
    this.data.businessMemories.unshift(mem);
    this.persist();
  }

  public saveAlert(alert: Alert) {
    this.data.alerts.unshift(alert);
    this.persist();
  }

  public saveConversation(conv: AIConversation) {
    const idx = this.data.aiConversations.findIndex(c => c.id === conv.id);
    if (idx >= 0) this.data.aiConversations[idx] = conv;
    else this.data.aiConversations.unshift(conv);
    this.persist();
  }

  public setSchemes(schemes: GovernmentScheme[]) {
    this.data.governmentSchemes = schemes;
    this.persist();
  }

  public setMarketIndicators(indicators: MarketIndicator[]) {
    this.data.marketIndicators = indicators;
    this.persist();
  }

  public resetToEmpty() {
    this.data = this.createEmptySchema();
    this.persist();
  }
}

export const db = new DatabaseService();
