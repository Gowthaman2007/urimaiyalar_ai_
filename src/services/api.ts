const API_BASE = '/api';

export class ApiError extends Error {
  code?: string;
  statusCode?: number;

  constructor(message: string, code?: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('urimaiyalar_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(
      data?.message || 'Server request failed',
      data?.code || 'REQUEST_FAILED',
      response.status
    );
  }

  return data?.data !== undefined ? data.data : data;
}

export const api = {
  // Auth
  register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<any>('/auth/me'),

  // Business
  getBusiness: () => request<any>('/business'),
  updateBusiness: (body: any) => request<any>('/business', { method: 'PUT', body: JSON.stringify(body) }),

  // Dashboard
  getDashboardSummary: (period = 'today', startDate?: string, endDate?: string) => {
    let url = `/dashboard/summary?period=${period}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return request<any>(url);
  },
  getTrends: (days = 7) => request<any>(`/dashboard/trends?days=${days}`),

  // Products & Inventory
  getProducts: (search?: string, category?: string) => {
    let url = '/products';
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (params.toString()) url += `?${params.toString()}`;
    return request<any>(url);
  },
  createProduct: (body: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id: string, body: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  getInventorySummary: () => request<any>('/inventory'),
  getLowStock: () => request<any>('/inventory/low-stock'),
  adjustStock: (body: any) => request<any>('/inventory/adjust', { method: 'POST', body: JSON.stringify(body) }),
  getInventoryTransactions: (productId?: string) => request<any>(`/inventory/transactions${productId ? `?productId=${productId}` : ''}`),

  // Sales
  getSales: async (limit = 50, offset = 0): Promise<any[]> => {
    const res = await request<any>(`/sales?limit=${limit}&offset=${offset}`);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.sales)) return res.sales;
    return [];
  },
  createSale: (body: any) => request<any>('/sales', { method: 'POST', body: JSON.stringify(body) }),

  // Purchases
  getPurchases: async (limit = 50, offset = 0): Promise<any[]> => {
    const res = await request<any>(`/purchases?limit=${limit}&offset=${offset}`);
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.purchases)) return res.purchases;
    return [];
  },
  createPurchase: (body: any) => request<any>('/purchases', { method: 'POST', body: JSON.stringify(body) }),
  recordPurchase: (body: any) => request<any>('/purchases', { method: 'POST', body: JSON.stringify(body) }),

  // Customers & Suppliers
  getCustomers: () => request<any>('/customers'),
  getCustomerDetail: (id: string) => request<any>(`/customers/${id}`),
  createCustomer: (body: any) => request<any>('/customers', { method: 'POST', body: JSON.stringify(body) }),
  getSuppliers: () => request<any>('/suppliers'),
  createSupplier: (body: any) => request<any>('/suppliers', { method: 'POST', body: JSON.stringify(body) }),

  // Credit Ledger
  getCreditSummary: () => request<any>('/credit/summary'),
  getCreditTransactions: (entityId?: string) => request<any>(`/credit/transactions${entityId ? `?entityId=${entityId}` : ''}`),
  recordPayment: (body: any) => request<any>('/credit/payment', { method: 'POST', body: JSON.stringify(body) }),
  addCredit: (body: any) => request<any>('/credit/add', { method: 'POST', body: JSON.stringify(body) }),

  // Expenses
  getExpenses: (category?: string, startDate?: string, endDate?: string) => {
    let url = '/expenses';
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) url += `?${params.toString()}`;
    return request<any>(url);
  },
  createExpense: (body: any) => request<any>('/expenses', { method: 'POST', body: JSON.stringify(body) }),
  deleteExpense: (id: string) => request<any>(`/expenses/${id}`, { method: 'DELETE' }),

  // Financial Intelligence
  getFinancialSummary: (period = 'this_month') => request<any>(`/financial/summary?period=${period}`),
  getPnL: (period = 'this_month') => request<any>(`/financial/pnl?period=${period}`),

  // Business Memory
  getMemories: (type?: string, importance?: string, search?: string) => {
    let url = '/memory';
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (importance) params.append('importance', importance);
    if (search) params.append('search', search);
    if (params.toString()) url += `?${params.toString()}`;
    return request<any>(url);
  },
  createMemory: (body: any) => request<any>('/memory', { method: 'POST', body: JSON.stringify(body) }),

  // Schemes & Market
  getSchemes: (category?: string, search?: string) => {
    let url = '/schemes';
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (params.toString()) url += `?${params.toString()}`;
    return request<any>(url);
  },
  getGovernmentSchemes: (category?: string, search?: string) => {
    let url = '/schemes';
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (params.toString()) url += `?${params.toString()}`;
    return request<any>(url);
  },
  getMarketIndicators: () => request<any>('/market'),
  getMarketPrices: (market?: string) => request<any>(`/market${market ? `?market=${encodeURIComponent(market)}` : ''}`),

  // Alerts
  getAlerts: () => request<any>('/alerts'),
  markAlertRead: (id: string) => request<any>(`/alerts/${id}/read`, { method: 'POST' }),
  resolveAlert: (id: string) => request<any>(`/alerts/${id}/read`, { method: 'POST' }),

  // Reports
  getReportData: (type: string, startDate?: string, endDate?: string) => {
    let url = `/reports/data?type=${type}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return request<any>(url);
  },

  // AI Assistant
  sendAssistantQuery: (query: string, conversationId?: string) =>
    request<any>('/assistant/query', { method: 'POST', body: JSON.stringify({ query, conversationId }) }),
  getAssistantConversations: () => request<any>('/assistant/conversations'),
  getConversationDetail: (id: string) => request<any>(`/assistant/conversations/${id}`),

  // Demo Reset
  resetDemoData: () => request<any>('/demo/reset', { method: 'POST' }),

  // Health
  checkHealth: () => request<any>('/health'),
};
