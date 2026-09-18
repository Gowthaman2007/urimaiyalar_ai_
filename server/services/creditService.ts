import { db } from '../database/db';
import { Customer, Supplier, CreditTransaction, BusinessMemory } from '../types';

export interface RecordPaymentInput {
  businessId: string;
  entityType: 'CUSTOMER' | 'SUPPLIER';
  entityId: string;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'BANK_TRANSFER';
  notes?: string;
}

export class CreditService {
  public static getLedgerSummary(businessId: string) {
    const customers = db.customers.filter(c => c.businessId === businessId);
    const suppliers = db.suppliers.filter(s => s.businessId === businessId);

    const totalReceivable = customers.reduce((sum, c) => sum + (c.outstandingCredit || 0), 0);
    const totalPayable = suppliers.reduce((sum, s) => sum + (s.outstandingPayable || 0), 0);

    const activeDebtors = customers.filter(c => (c.outstandingCredit || 0) > 0);
    const activeCreditors = suppliers.filter(s => (s.outstandingPayable || 0) > 0);

    return {
      totalReceivable,
      totalPayable,
      netWorkingCapitalImpact: totalReceivable - totalPayable,
      customersWithDue: activeDebtors.length,
      suppliersWithDue: activeCreditors.length
    };
  }

  public static async recordPayment(input: RecordPaymentInput): Promise<CreditTransaction> {
    return await db.runTransaction(async () => {
      const now = new Date().toISOString();

      if (input.entityType === 'CUSTOMER') {
        const customer = db.customers.find(c => c.id === input.entityId && c.businessId === input.businessId);
        if (!customer) {
          throw new Error('Customer not found.');
        }

        const prevBalance = customer.outstandingCredit;
        customer.outstandingCredit = Math.max(0, prevBalance - input.amount);
        customer.totalPaid += input.amount;
        customer.updatedAt = now;
        db.saveCustomer(customer);

        const tx: CreditTransaction = {
          id: `ctx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          businessId: input.businessId,
          entityType: 'CUSTOMER',
          entityId: customer.id,
          entityName: customer.name,
          type: 'PAYMENT_RECEIVED',
          amount: input.amount,
          balanceAfter: customer.outstandingCredit,
          paymentMethod: input.paymentMethod,
          notes: input.notes || 'Partial/Full credit clearance payment',
          createdAt: now
        };
        db.saveCreditTransaction(tx);

        const mem: BusinessMemory = {
          id: `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          businessId: input.businessId,
          type: 'EVENT',
          title: `Payment Received: ${customer.name} (₹${input.amount})`,
          content: `Customer ${customer.name} paid ₹${input.amount} via ${input.paymentMethod}. Remaining balance: ₹${customer.outstandingCredit}.`,
          tamilContent: `வாடிக்கையாளர் ${customer.name}-இடமிருந்து ₹${input.amount} (${input.paymentMethod}) வரவு வைக்கப்பட்டது. மீதமுள்ள கடன் நிலுவை: ₹${customer.outstandingCredit}.`,
          source: 'SALES_ENGINE',
          importance: 'MEDIUM',
          createdAt: now
        };
        db.saveBusinessMemory(mem);

        return tx;
      } else {
        const supplier = db.suppliers.find(s => s.id === input.entityId && s.businessId === input.businessId);
        if (!supplier) {
          throw new Error('Supplier not found.');
        }

        const prevBalance = supplier.outstandingPayable;
        supplier.outstandingPayable = Math.max(0, prevBalance - input.amount);
        supplier.totalPaid += input.amount;
        supplier.updatedAt = now;
        db.saveSupplier(supplier);

        const tx: CreditTransaction = {
          id: `ctx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          businessId: input.businessId,
          entityType: 'SUPPLIER',
          entityId: supplier.id,
          entityName: supplier.name,
          type: 'SUPPLIER_PAYMENT',
          amount: input.amount,
          balanceAfter: supplier.outstandingPayable,
          paymentMethod: input.paymentMethod,
          notes: input.notes || 'Supplier settlement payment',
          createdAt: now
        };
        db.saveCreditTransaction(tx);

        const mem: BusinessMemory = {
          id: `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          businessId: input.businessId,
          type: 'EVENT',
          title: `Supplier Payment Made: ${supplier.name} (₹${input.amount})`,
          content: `Paid ₹${input.amount} to supplier ${supplier.name} via ${input.paymentMethod}. Remaining payable: ₹${supplier.outstandingPayable}.`,
          tamilContent: `சப்ளையர் ${supplier.name}-க்கு ₹${input.amount} (${input.paymentMethod}) செலுத்தப்பட்டது. மீதமுள்ள கடன்: ₹${supplier.outstandingPayable}.`,
          source: 'SALES_ENGINE',
          importance: 'MEDIUM',
          createdAt: now
        };
        db.saveBusinessMemory(mem);

        return tx;
      }
    });
  }

  public static async addCredit(businessId: string, customerId: string, amount: number, notes?: string): Promise<CreditTransaction> {
    return await db.runTransaction(async () => {
      const now = new Date().toISOString();
      const customer = db.customers.find(c => c.id === customerId && c.businessId === businessId);
      if (!customer) {
        throw new Error('Customer not found.');
      }

      customer.outstandingCredit += amount;
      customer.updatedAt = now;
      db.saveCustomer(customer);

      const tx: CreditTransaction = {
        id: `ctx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        businessId,
        entityType: 'CUSTOMER',
        entityId: customer.id,
        entityName: customer.name,
        type: 'CREDIT_GIVEN',
        amount,
        balanceAfter: customer.outstandingCredit,
        paymentMethod: 'CREDIT',
        notes: notes || 'Manual credit added',
        createdAt: now
      };
      db.saveCreditTransaction(tx);

      const mem: BusinessMemory = {
        id: `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        businessId,
        type: 'EVENT',
        title: `Credit Added: ${customer.name} (₹${amount})`,
        content: `Added credit of ₹${amount} for ${customer.name}. New outstanding balance: ₹${customer.outstandingCredit}.`,
        tamilContent: `${customer.name}-க்கு ₹${amount} கடன் சேர்க்கப்பட்டது. மொத்த நிலுவைத் தொகை: ₹${customer.outstandingCredit}.`,
        source: 'USER_NOTE',
        importance: 'MEDIUM',
        createdAt: now
      };
      db.saveBusinessMemory(mem);

      return tx;
    });
  }

  public static getTransactions(businessId: string, entityId?: string, limit = 50) {
    let list = db.creditTransactions.filter(t => t.businessId === businessId);
    if (entityId) {
      list = list.filter(t => t.entityId === entityId);
    }
    return list.slice(0, limit);
  }
}
