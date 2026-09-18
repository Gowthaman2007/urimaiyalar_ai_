import { db } from '../database/db';
import { Product, InventoryTransaction, InventoryTransactionType, BusinessMemory } from '../types';

export class InventoryService {
  public static getProducts(businessId: string, search?: string, category?: string) {
    let list = db.products.filter(p => p.businessId === businessId && p.status !== 'ARCHIVED');
    if (category) {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.tamilName && p.tamilName.toLowerCase().includes(q)) || 
        p.sku.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public static getLowStockProducts(businessId: string) {
    return db.products.filter(p => p.businessId === businessId && p.status === 'ACTIVE' && p.currentStock <= p.minimumStock);
  }

  public static getInventorySummary(businessId: string) {
    const products = db.products.filter(p => p.businessId === businessId && p.status !== 'ARCHIVED');
    const totalItems = products.length;
    const totalStockValue = products.reduce((sum, p) => sum + (p.currentStock * p.purchasePrice), 0);
    const totalRetailValue = products.reduce((sum, p) => sum + (p.currentStock * p.sellingPrice), 0);
    const lowStockCount = products.filter(p => p.currentStock <= p.minimumStock && p.currentStock > 0).length;
    const outOfStockCount = products.filter(p => p.currentStock <= 0).length;

    return {
      totalItems,
      totalStockValue,
      totalRetailValue,
      potentialProfit: totalRetailValue - totalStockValue,
      lowStockCount,
      outOfStockCount
    };
  }

  public static async createProduct(businessId: string, data: Omit<Product, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const existingSku = db.products.find(p => p.businessId === businessId && p.sku.toLowerCase() === data.sku.toLowerCase());
    if (existingSku) {
      throw new Error(`Product SKU "${data.sku}" already exists in your inventory.`);
    }

    const now = new Date().toISOString();
    const product: Product = {
      ...data,
      id: `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      businessId,
      createdAt: now,
      updatedAt: now
    };

    db.saveProduct(product);

    if (product.currentStock > 0) {
      const invTx: InventoryTransaction = {
        id: `invtx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        businessId,
        productId: product.id,
        productName: product.name,
        type: 'ADJUSTMENT',
        quantityChange: product.currentStock,
        previousStock: 0,
        newStock: product.currentStock,
        reason: 'Initial stock entry',
        createdAt: now
      };
      db.saveInventoryTransaction(invTx);
    }

    return product;
  }

  public static async updateProduct(businessId: string, id: string, data: Partial<Product>): Promise<Product> {
    const product = db.products.find(p => p.id === id && p.businessId === businessId);
    if (!product) {
      throw new Error('Product not found.');
    }

    const now = new Date().toISOString();
    Object.assign(product, {
      ...data,
      updatedAt: now
    });

    db.saveProduct(product);
    return product;
  }

  public static async adjustStock(businessId: string, productId: string, newStock: number, type: InventoryTransactionType, reason: string): Promise<Product> {
    return await db.runTransaction(async () => {
      const product = db.products.find(p => p.id === productId && p.businessId === businessId);
      if (!product) {
        throw new Error('Product not found.');
      }

      const prevStock = product.currentStock;
      const diff = newStock - prevStock;
      const now = new Date().toISOString();

      product.currentStock = newStock;
      product.updatedAt = now;
      db.saveProduct(product);

      const invTx: InventoryTransaction = {
        id: `invtx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        businessId,
        productId: product.id,
        productName: product.name,
        type,
        quantityChange: diff,
        previousStock: prevStock,
        newStock,
        reason,
        createdAt: now
      };
      db.saveInventoryTransaction(invTx);

      const mem: BusinessMemory = {
        id: `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        businessId,
        type: 'EVENT',
        title: `Inventory Adjusted: ${product.name}`,
        content: `Stock adjusted from ${prevStock} to ${newStock} ${product.unit} (Reason: ${reason}, Type: ${type}).`,
        tamilContent: `${product.tamilName || product.name} சரக்கு இருப்பு ${prevStock}-லிருந்து ${newStock}-ஆக மாற்றப்பட்டது. காரணம்: ${reason}.`,
        source: 'INVENTORY_SCAN',
        importance: 'LOW',
        createdAt: now
      };
      db.saveBusinessMemory(mem);

      return product;
    });
  }

  public static getStockTransactions(businessId: string, productId?: string, limit = 50) {
    let list = db.inventoryTransactions.filter(t => t.businessId === businessId);
    if (productId) {
      list = list.filter(t => t.productId === productId);
    }
    return list.slice(0, limit);
  }
}
