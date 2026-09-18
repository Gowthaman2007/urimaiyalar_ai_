import { db } from '../database/db';
import { Expense, ExpenseCategory, BusinessMemory } from '../types';

export interface CreateExpenseInput {
  businessId: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'BANK_TRANSFER';
  description: string;
  date?: string;
}

export class ExpenseService {
  public static getExpenses(businessId: string, category?: string, startDate?: string, endDate?: string) {
    let list = db.expenses.filter(e => e.businessId === businessId);
    if (category && category !== 'ALL') {
      list = list.filter(e => e.category.toLowerCase() === category.toLowerCase());
    }
    if (startDate) {
      list = list.filter(e => e.date >= startDate);
    }
    if (endDate) {
      list = list.filter(e => e.date <= endDate);
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public static async createExpense(input: CreateExpenseInput): Promise<Expense> {
    const now = new Date().toISOString();
    const date = input.date || now.split('T')[0];
    const expense: Expense = {
      id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      businessId: input.businessId,
      category: input.category,
      amount: input.amount,
      paymentMethod: input.paymentMethod,
      description: input.description,
      date,
      createdAt: now
    };

    db.saveExpense(expense);

    if (expense.amount >= 2000) {
      const mem: BusinessMemory = {
        id: `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        businessId: input.businessId,
        type: 'EVENT',
        title: `Major Expense: ₹${expense.amount} (${expense.category})`,
        content: `Recorded expense of ₹${expense.amount} for ${expense.description} (${expense.category}).`,
        tamilContent: `${expense.category} செலவு ₹${expense.amount} (${expense.description}) பதிவு செய்யப்பட்டது.`,
        source: 'FINANCIAL_INSIGHT',
        importance: 'HIGH',
        createdAt: now
      };
      db.saveBusinessMemory(mem);
    }

    return expense;
  }

  public static async deleteExpense(businessId: string, id: string): Promise<boolean> {
    const initialLen = db.expenses.length;
    (db as any).data.expenses = db.expenses.filter(e => !(e.id === id && e.businessId === businessId));
    db.persist();
    return db.expenses.length < initialLen;
  }
}
