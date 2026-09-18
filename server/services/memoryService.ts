import { db } from '../database/db';
import { BusinessMemory, MemoryType } from '../types';

export interface VectorSearchOptions {
  limit?: number;
  threshold?: number;
}

export interface IVectorMemoryProvider {
  storeEmbedding(id: string, text: string, metadata: any): Promise<void>;
  searchMemory(query: string, businessId: string, options?: VectorSearchOptions): Promise<BusinessMemory[]>;
  deleteEmbedding(id: string): Promise<void>;
}

/**
 * Local / In-memory Vector and Semantic Search Abstraction
 * Fully interchangeable with pgvector or custom embedding endpoints!
 */
export class MemoryService implements IVectorMemoryProvider {
  public async storeEmbedding(id: string, text: string, metadata: any): Promise<void> {
    // Vector embedding placeholder: ready for pgvector storage
  }

  public async deleteEmbedding(id: string): Promise<void> {
    // Vector deletion placeholder
  }

  public async searchMemory(query: string, businessId: string, options?: VectorSearchOptions): Promise<BusinessMemory[]> {
    const q = query.toLowerCase().trim();
    const list = db.businessMemories.filter(m => m.businessId === businessId);
    if (!q) return list.slice(0, options?.limit || 20);

    // Multi-term keyword and semantic score matching
    const terms = q.split(/\s+/);
    const scored = list.map(m => {
      let score = 0;
      const combined = `${m.title} ${m.content} ${m.tamilContent || ''} ${m.type}`.toLowerCase();
      terms.forEach(term => {
        if (combined.includes(term)) score += 1;
      });
      if (m.importance === 'HIGH') score += 0.5;
      return { memory: m, score };
    });

    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.memory)
      .slice(0, options?.limit || 20);
  }

  public static getMemories(businessId: string, type?: MemoryType, importance?: string, search?: string) {
    let list = db.businessMemories.filter(m => m.businessId === businessId);
    if (type) {
      list = list.filter(m => m.type === type);
    }
    if (importance) {
      list = list.filter(m => m.importance === importance);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(m => 
        m.title.toLowerCase().includes(q) || 
        m.content.toLowerCase().includes(q) || 
        (m.tamilContent && m.tamilContent.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static async createMemory(businessId: string, data: Omit<BusinessMemory, 'id' | 'businessId' | 'createdAt'>): Promise<BusinessMemory> {
    const now = new Date().toISOString();
    const memory: BusinessMemory = {
      ...data,
      id: `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      businessId,
      createdAt: now
    };
    db.saveBusinessMemory(memory);
    return memory;
  }
}

export const memoryService = new MemoryService();
