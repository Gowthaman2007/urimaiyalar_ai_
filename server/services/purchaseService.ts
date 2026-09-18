import { db } from '../database/db';
import { Purchase, PurchaseItem, InventoryTransaction, CreditTransaction, BusinessMemory } from '../types';

export interface CreatePurchaseInput {
  businessId: string;
  billNumber: string;
  supplierId?: string;
  supplierName: string;
  supplierPhone?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitCost: number;
  }>;
  paidAmount: number;
  creditAmount?: number;
  paymentMethod: 'CASH' | 'UPI' | 'CREDIT' | 'BANK_TRANSFER';
  notes?: string;
}

export class PurchaseService {
  public static async createPurchase(input: CreatePurchaseInput): Promise<Purchase> {
    return await db.runTransaction(async () => {
      const now = new Date().toISOString();
      const purchaseId = `purch-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      let totalGross = 0;
      const purchaseItems: PurchaseItem[] = [];

      // 1. Process items and increase inventory
      for (const itemInput of input.items) {
        const product = db.products.find(p => p.id === itemInput.productId && p.businessId === input.businessId);
        if (!product) {
          throw new Error(`Product not found with ID: ${itemInput.productId}`);
        }

        const subtotal = itemInput.unitCost * itemInput.quantity;
        totalGross += subtotal;

        purchaseItems.push({
          productId: product.id,
          productName: product.name,
          unit: product.unit,
          quantity: itemInput.quantity,
          unitCost: itemInput.unitCost,
          subtotal
        });

        // Increase product stock
        const prevStock = product.currentStock;
        const newStock = prevStock + itemInput.quantity;
        product.currentStock = newStock;
        product.purchasePrice = itemInput.unitCost; // Update latest cost
        product.updatedAt = now;
        db.saveProduct(product);

        // Record inventory transaction
        const invTx: InventoryTransaction = {
          id: `invtx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          businessId: input.businessId,
          productId: product.id,
          productName: product.name,
          type: 'PURCHASE',
          quantityChange: itemInput.quantity,
          previousStock: prevStock,
          newStock: newStock,
          reason: `Purchase Bill ${input.billNumber}`,
          referenceId: purchaseId,
          createdAt: now
        };
        db.saveInventoryTransaction(invTx);
      }

      let paidAmount = input.paidAmount;
      let creditAmount = input.creditAmount !== undefined ? input.creditAmount : 0;

      if (input.paymentMethod === 'CREDIT') {
        creditAmount = totalGross;
        paidAmount = 0;
      } else if (creditAmount === 0) {
        paidAmount = totalGross;
      }

      // 2. Update Supplier Payable
      let supplierId = input.supplierId;
      if (input.supplierName) {
        let supplier = supplierId ? db.suppliers.find(s => s.id === supplierId && s.businessId === input.businessId) : null;
        if (!supplier) {
          supplier = db.suppliers.find(s => s.businessId === input.businessId && s.name.toLowerCase() === input.supplierName.toLowerCase());
          if (!supplier) {
            supplier = {
              id: `supp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              businessId: input.businessId,
              name: input.supplierName,
              phone: input.supplierPhone || '',
              totalPurchases: 0,
              totalPaid: 0,
              outstandingPayable: 0,
              createdAt: now,
              updatedAt: now
            };
          }
        }

        if (supplier) {
          supplierId = supplier.id;
          supplier.totalPurchases += totalGross;
          supplier.totalPaid += paidAmount;
          supplier.outstandingPayable += creditAmount;
          supplier.updatedAt = now;
          db.saveSupplier(supplier);

          if (creditAmount > 0) {
            const creditTx: CreditTransaction = {
              id: `ctx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              businessId: input.businessId,
              entityType: 'SUPPLIER',
              entityId: supplier.id,
              entityName: supplier.name,
              type: 'PURCHASE_ON_CREDIT',
              amount: creditAmount,
              balanceAfter: supplier.outstandingPayable,
              paymentMethod: input.paymentMethod,
              notes: `Credit on Purchase bill ${input.billNumber}`,
              referencePurchaseId: purchaseId,
              createdAt: now
            };
            db.saveCreditTransaction(creditTx);
          }
        }
      }

      // 3. Save Purchase Record
      const purchase: Purchase = {
        id: purchaseId,
        businessId: input.businessId,
        billNumber: input.billNumber,
        supplierId,
        supplierName: input.supplierName,
        supplierPhone: input.supplierPhone,
        items: purchaseItems,
        totalAmount: totalGross,
        paidAmount,
        creditAmount,
        paymentMethod: input.paymentMethod,
        notes: input.notes,
        createdAt: now
      };
      db.savePurchase(purchase);

      // 4. Record Business Memory
      const memory: BusinessMemory = {
        id: `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        businessId: input.businessId,
        type: 'EVENT',
        title: `Stock Purchase Received: ${input.billNumber} (₹${totalGross})`,
        content: `Stock replenished from ${input.supplierName}: ${purchaseItems.map(i => `${i.quantity} ${i.unit} ${i.productName}`).join(', ')}. Paid: ₹${paidAmount}, Payable: ₹${creditAmount}.`,
        tamilContent: `${input.supplierName}-இடமிருந்து சரக்கு வரவு வைக்கப்பட்டது: பில் எண் ${input.billNumber}, மதிப்பு ₹${totalGross}. செலுத்த வேண்டிய கடன்: ₹${creditAmount}.`,
        source: 'INVENTORY_SCAN',
        importance: 'MEDIUM',
        metadata: { purchaseId, billNumber: input.billNumber, totalGross, supplierName: input.supplierName },
        createdAt: now
      };
      db.saveBusinessMemory(memory);

      return purchase;
    });
  }

  public static getPurchases(businessId: string, limit = 50, offset = 0) {
    const list = db.purchases.filter(p => p.businessId === businessId);
    return {
      total: list.length,
      purchases: list.slice(offset, offset + limit)
    };
  }
}
