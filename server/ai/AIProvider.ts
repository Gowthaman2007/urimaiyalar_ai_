/**
 * URIMAIYALAR AI - Provider Abstraction Layer
 */

export interface AIResult {
  intent?: string;
  confidence?: number;
  entities?: Record<string, any>;
  language?: 'ta' | 'en' | 'tanglish';
  text: string;
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
}

export interface BusinessContext {
  businessId: string;
  businessName: string;
  ownerName: string;
  category: string;
  currency: string;
  language: string;
}

export interface IAIProvider {
  name: string;
  understandQuery(query: string, context: BusinessContext): Promise<AIResult>;
}
