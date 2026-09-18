import { db } from '../database/db';
import { Sale, SaleItem, InventoryTransaction, CreditTransaction, BusinessMemory, Alert } from '../types';

export interface CreateSaleInput {
  businessId: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice?: number;
    discount?: number;
  }>;
  discountAmount?: number;
  taxAmount?: number;
  paymentMethod: 'CASH' | 'UPI' | 'CREDIT' | 'SPLIT' | 'CARD';
  paidAmount: number;
  creditAmount?: number;
  notes?: string;
}

export class SalesService {
  public static async createSale(input: CreateSaleInput): Promise<Sale> {
    return await db.runTransaction(async () => {
      const now = new Date().toISOString();
      const saleId = `sale-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(db.sales.filter(s => s.businessId === input.businessId).length + 1).padStart(4, '0')}`;

      let totalGross = 0;
      const saleItems: SaleItem[] = [];

      // 1. Process items and validate stock
      for (const itemInput of input.items) {
        const product = db.products.find(p => p.id === itemInput.productId && p.businessId === input.businessId);
        if (!product) {
          throw new Error(`Product not found with ID: ${itemInput.productId}`);
        }

        if (product.currentStock < itemInput.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.currentStock} ${product.unit}, requested: ${itemInput.quantity}`);
        }

        const unitPrice = itemInput.unitPrice !== undefined ? itemInput.unitPrice : product.sellingPrice;
        const subtotal = unitPrice * itemInput.quantity;
        totalGross += subtotal;

        saleItems.push({
          productId: product.id,
          productName: product.name,
          unit: product.unit,
          quantity: itemInput.quantity,
          unitPrice,
          purchasePrice: product.purchasePrice,
          subtotal
        });

        // Decrement product stock
        const prevStock = product.currentStock;
        const newStock = prevStock - itemInput.quantity;
        product.currentStock = newStock;
        product.updatedAt = now;
        db.saveProduct(product);

        // Record inventory transaction
        const invTx: InventoryTransaction = {
          id: `invtx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          businessId: input.businessId,
          productId: product.id,
          productName: product.name,
          type: 'SALE',
          quantityChange: -itemInput.quantity,
          previousStock: prevStock,
          newStock: newStock,
          reason: `Sale ${invoiceNumber}`,
          referenceId: saleId,
          createdAt: now
        };
        db.saveInventoryTransaction(invTx);

        // Low stock alert check
        if (newStock <= product.minimumStock) {
          const alert: Alert = {
            id: `alt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            businessId: input.businessId,
            type: 'LOW_STOCK',
            severity: newStock === 0 ? 'CRITICAL' : 'WARNING',
            title: `${product.tamilName || product.name} கையிருப்பு குறைவு!`,
            message: `${product.name} stock is at ${newStock} ${product.unit} (Minimum: ${product.minimumStock}). Please order from supplier.`,
            tamilMessage: `${product.tamilName || product.name} கையிருப்பு ${newStock} ${product.unit} மட்டுமே உள்ளது (குறைந்தபட்ச தேவை: ${product.minimumStock}).`,
            isRead: false,
            link: '/inventory',
            createdAt: now
          };
          db.saveAlert(alert);
        }
      }

      const discountAmount = input.discountAmount || 0;
      const taxAmount = input.taxAmount || 0;
      const netAmount = Math.max(0, totalGross - discountAmount + taxAmount);

      let paidAmount = input.paidAmount;
      let creditAmount = input.creditAmount !== undefined ? input.creditAmount : 0;

      if (input.paymentMethod === 'CREDIT') {
        creditAmount = netAmount;
        paidAmount = 0;
      } else if (input.paymentMethod !== 'SPLIT') {
        paidAmount = netAmount;
        creditAmount = 0;
      }

      // 2. Customer Credit Handling
      let customerId = input.customerId;
      if (creditAmount > 0 || customerId) {
        let customer = customerId ? db.customers.find(c => c.id === customerId && c.businessId === input.businessId) : null;
        if (!customer && input.customerName) {
          // Find by phone or name
          customer = db.customers.find(c => c.businessId === input.businessId && ((input.customerPhone && c.phone === input.customerPhone) || c.name.toLowerCase() === input.customerName.toLowerCase()));
          if (!customer) {
            customer = {
              id: `cust-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              businessId: input.businessId,
              name: input.customerName,
              phone: input.customerPhone || '',
              totalPurchases: 0,
              totalPaid: 0,
              outstandingCredit: 0,
              createdAt: now,
              updatedAt: now
            };
          }
        }

        if (customer) {
          customerId = customer.id;
          customer.totalPurchases += netAmount;
          customer.totalPaid += paidAmount;
          customer.outstandingCredit += creditAmount;
          customer.updatedAt = now;
          db.saveCustomer(customer);

          if (creditAmount > 0) {
            const creditTx: CreditTransaction = {
              id: `ctx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              businessId: input.businessId,
              entityType: 'CUSTOMER',
              entityId: customer.id,
              entityName: customer.name,
              type: 'CREDIT_GIVEN',
              amount: creditAmount,
              balanceAfter: customer.outstandingCredit,
              paymentMethod: input.paymentMethod,
              notes: `Credit on sale ${invoiceNumber}`,
              referenceSaleId: saleId,
              createdAt: now
            };
            db.saveCreditTransaction(creditTx);
          }
        }
      }

      // 3. Save Sale Record
      const newSale: Sale = {
        id: saleId,
        businessId: input.businessId,
        invoiceNumber,
        customerId,
        customerName: input.customerName || 'Walk-in Customer',
        customerPhone: input.customerPhone,
        items: saleItems,
        totalAmount: totalGross,
        discountAmount,
        taxAmount,
        netAmount,
        paymentMethod: input.paymentMethod,
        paidAmount,
        creditAmount,
        notes: input.notes,
        createdAt: now
      };
      db.saveSale(newSale);

      // 4. Record Business Memory Event
      const memory: BusinessMemory = {
        id: `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        businessId: input.businessId,
        type: 'EVENT',
        title: `Sale Recorded: ${invoiceNumber} (₹${netAmount})`,
        content: `Sold ${saleItems.map(i => `${i.quantity} ${i.unit} ${i.productName}`).join(', ')} to ${newSale.customerName}. Payment: ${input.paymentMethod} (Paid: ₹${paidAmount}, Credit: ₹${creditAmount}).`,
        tamilContent: `${newSale.customerName}-க்கு ${invoiceNumber} பில் மூலம் ₹${netAmount} மதிப்புள்ள பொருட்கள் விற்பனை செய்யப்பட்டது. (செலுத்தியது: ₹${paidAmount}, கடன்: ₹${creditAmount}).`,
        source: 'SALES_ENGINE',
        importance: netAmount > 2000 ? 'HIGH' : 'MEDIUM',
        metadata: { saleId, invoiceNumber, netAmount, customerName: newSale.customerName },
        createdAt: now
      };
      db.saveBusinessMemory(memory);

      return newSale;
    });
  }

  public static getSales(businessId: string, limit = 50, offset = 0) {
    const list = db.sales.filter(s => s.businessId === businessId);
    return {
      total: list.length,
      sales: list.slice(offset, offset + limit)
    };
  }

  public static getSaleById(businessId: string, id: string): Sale | undefined {
    return db.sales.find(s => s.id === id && s.businessId === businessId);
  }
}
