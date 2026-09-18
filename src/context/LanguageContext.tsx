import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ta' | 'en' | 'tanglish';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  isTamil: boolean;
  isEnglish: boolean;
  isTanglish: boolean;
}

export const translations: Record<string, Record<Language, string>> = {
  // Brand & Navigation
  appTitle: {
    ta: 'உரிமையாளர் AI',
    en: 'URIMAIYALAR AI',
    tanglish: 'Urimaiyalar AI',
  },
  appTagline: {
    ta: 'வணிக நுண்ணறிவு தளம் • Business Intelligence',
    en: 'Business Intelligence Platform for Retail & MSMEs',
    tanglish: 'Business Intelligence Platform for Retail & MSMEs',
  },
  mainMenu: {
    ta: 'முதன்மை மெனு',
    en: 'MAIN MENU',
    tanglish: 'MAIN MENU',
  },
  dashboard: {
    ta: 'முகப்பு (Dashboard)',
    en: 'Dashboard',
    tanglish: 'Dashboard',
  },
  assistant: {
    ta: 'AI உதவியாளர் (AI Brain)',
    en: 'AI Assistant',
    tanglish: 'AI Assistant',
  },
  sales: {
    ta: 'விற்பனை (Sales)',
    en: 'Sales Ledger',
    tanglish: 'Sales Kanakku',
  },
  purchases: {
    ta: 'கொள்முதல் (Purchases)',
    en: 'Purchases',
    tanglish: 'Purchase Kanakku',
  },
  inventory: {
    ta: 'சரக்கு இருப்பு (Inventory)',
    en: 'Inventory Stock',
    tanglish: 'Stock & Inventory',
  },
  customers: {
    ta: 'வாடிக்கையாளர்கள் (Customers)',
    en: 'Customers',
    tanglish: 'Customer Ledger',
  },
  suppliers: {
    ta: 'சப்ளையர்கள் (Suppliers)',
    en: 'Suppliers',
    tanglish: 'Supplier Ledger',
  },
  credit: {
    ta: 'கடன் கணக்கு (Credit Ledger)',
    en: 'Credit Ledger',
    tanglish: 'Kadan Kanakku',
  },
  expenses: {
    ta: 'செலவுகள் (Expenses)',
    en: 'Expenses',
    tanglish: 'Selavugal',
  },
  financialIntelligence: {
    ta: 'நிதி நுண்ணறிவு (Financial Intel)',
    en: 'Financial Intelligence',
    tanglish: 'Financial Intel',
  },
  memory: {
    ta: 'வணிக நினைவகம் (Memory)',
    en: 'Business Memory',
    tanglish: 'Business Memory',
  },
  schemes: {
    ta: 'அரசு திட்டங்கள் (Govt Schemes)',
    en: 'Government Schemes',
    tanglish: 'Govt Schemes',
  },
  market: {
    ta: 'சந்தை நிலவரம் (Market Intel)',
    en: 'Market Intelligence',
    tanglish: 'Market Nilavaram',
  },
  alerts: {
    ta: 'எச்சரிக்கைகள் (Alerts)',
    en: 'Alerts',
    tanglish: 'Alerts',
  },
  reports: {
    ta: 'அறிக்கைகள் (Reports)',
    en: 'Reports & Export',
    tanglish: 'Reports & Export',
  },
  settings: {
    ta: 'அமைப்புகள் (Settings)',
    en: 'Settings',
    tanglish: 'Settings',
  },
  logout: {
    ta: 'வெளியேறு (Logout)',
    en: 'Log Out',
    tanglish: 'Logout',
  },

  // Periods
  today: {
    ta: 'இன்று',
    en: 'Today',
    tanglish: 'Inniku',
  },
  yesterday: {
    ta: 'நேற்று',
    en: 'Yesterday',
    tanglish: 'Netru',
  },
  days7: {
    ta: '7 நாட்கள்',
    en: '7 Days',
    tanglish: '7 Days',
  },
  days30: {
    ta: '30 நாட்கள்',
    en: '30 Days',
    tanglish: '30 Days',
  },
  thisMonth: {
    ta: 'இந்த மாதம்',
    en: 'This Month',
    tanglish: 'Indha Month',
  },
  lastMonth: {
    ta: 'கடந்த மாதம்',
    en: 'Last Month',
    tanglish: 'Kadantha Month',
  },

  // KPI Card Titles
  todaySales: {
    ta: 'இன்றைய விற்பனை',
    en: "Today's Sales",
    tanglish: 'Inniku Sales',
  },
  todayExpenses: {
    ta: 'இன்றைய செலவுகள்',
    en: "Today's Expenses",
    tanglish: 'Inniku Selavu',
  },
  netProfit: {
    ta: 'நிகர லாபம்',
    en: 'Net Profit',
    tanglish: 'Net Laabam',
  },
  receivables: {
    ta: 'வசூலிக்க வேண்டிய கடன்',
    en: 'Customer Receivables',
    tanglish: 'Customer Kadan',
  },
  payables: {
    ta: 'செலுத்த வேண்டிய கடன்',
    en: 'Supplier Payables',
    tanglish: 'Supplier Kadan',
  },
  stockValue: {
    ta: 'மொத்த சரக்கு மதிப்பு',
    en: 'Total Inventory Value',
    tanglish: 'Stock Mathippu',
  },
  lowStockAlert: {
    ta: 'இருப்பு குறைவு',
    en: 'Low Stock Alert',
    tanglish: 'Stock Kammi',
  },

  // Common Actions & Buttons
  newSale: {
    ta: 'புதிய விற்பனை',
    en: 'New Sale',
    tanglish: 'New Sale',
  },
  newPurchase: {
    ta: 'புதிய கொள்முதல்',
    en: 'New Purchase',
    tanglish: 'New Purchase',
  },
  addProduct: {
    ta: 'பொருள் சேர்க்க',
    en: 'Add Product',
    tanglish: 'Add Product',
  },
  addCustomer: {
    ta: 'புதிய வாடிக்கையாளர்',
    en: 'Add Customer',
    tanglish: 'Add Customer',
  },
  addSupplier: {
    ta: 'புதிய சப்ளையர்',
    en: 'Add Supplier',
    tanglish: 'Add Supplier',
  },
  addExpense: {
    ta: 'செலவு சேர்க்க',
    en: 'Add Expense',
    tanglish: 'Add Selavu',
  },
  recordPayment: {
    ta: 'பணம் வரவு/பற்று',
    en: 'Record Payment',
    tanglish: 'Record Payment',
  },
  addMemory: {
    ta: 'நினைவகம் சேர்க்க',
    en: 'Add Memory Note',
    tanglish: 'Add Memory Note',
  },
  save: {
    ta: 'சேமி',
    en: 'Save',
    tanglish: 'Save',
  },
  saving: {
    ta: 'சேமிக்கிறது...',
    en: 'Saving...',
    tanglish: 'Saving...',
  },
  cancel: {
    ta: 'ரத்து செய்',
    en: 'Cancel',
    tanglish: 'Cancel',
  },
  delete: {
    ta: 'நீக்கு',
    en: 'Delete',
    tanglish: 'Delete',
  },
  edit: {
    ta: 'திருத்து',
    en: 'Edit',
    tanglish: 'Edit',
  },
  search: {
    ta: 'தேடவும்...',
    en: 'Search...',
    tanglish: 'Thedavum...',
  },
  filterAll: {
    ta: 'அனைத்தும்',
    en: 'All',
    tanglish: 'All',
  },
  cash: {
    ta: 'ரொக்கம்',
    en: 'Cash',
    tanglish: 'Cash',
  },
  creditType: {
    ta: 'கடன்',
    en: 'Credit',
    tanglish: 'Credit',
  },
  onlineUpi: {
    ta: 'ஆன்லைன் / UPI',
    en: 'Online / UPI',
    tanglish: 'Online / UPI',
  },
  exportCsv: {
    ta: 'CSV ஏற்றுமதி',
    en: 'Export CSV',
    tanglish: 'Export CSV',
  },
  print: {
    ta: 'அச்சிடு',
    en: 'Print',
    tanglish: 'Print',
  },
  viewAll: {
    ta: 'அனைத்தையும் பார்',
    en: 'View All',
    tanglish: 'View All',
  },
  status: {
    ta: 'நிலை',
    en: 'Status',
    tanglish: 'Status',
  },
  actions: {
    ta: 'நடவடிக்கை',
    en: 'Actions',
    tanglish: 'Actions',
  },
  date: {
    ta: 'தேதி',
    en: 'Date',
    tanglish: 'Date',
  },
  total: {
    ta: 'மொத்தம்',
    en: 'Total',
    tanglish: 'Total',
  },
  paid: {
    ta: 'செலுத்தியது',
    en: 'Paid',
    tanglish: 'Paid',
  },
  balance: {
    ta: 'மீதி / கடன்',
    en: 'Balance / Due',
    tanglish: 'Balance',
  },

  // View Specific Headers & Subtitles
  dashboardTitle: {
    ta: 'வணிக மேலோட்டம்',
    en: 'Business Overview',
    tanglish: 'Business Overview',
  },
  dashboardSubtitle: {
    ta: 'உடனடி லாப நட்ட கணக்கு மற்றும் நேரடி வணிக நிலவரம்',
    en: 'Real-time Profit & Loss, Cash Flow and Store Intelligence',
    tanglish: 'Real-time Profit & Loss and Live Store Intelligence',
  },
  salesTitle: {
    ta: 'விற்பனை ஏடு',
    en: 'Sales Invoices',
    tanglish: 'Sales Invoices',
  },
  salesSubtitle: {
    ta: 'பில் போடுதல், சரக்கு தானியங்கி கழிவு மற்றும் ரொக்க/கடன் கணக்கு',
    en: 'Invoicing, automatic inventory deduction, cash & credit sales tracking',
    tanglish: 'Bill podudhal, automatic stock deduction and cash/credit sales tracking',
  },
  purchasesTitle: {
    ta: 'கொள்முதல் ஏடு',
    en: 'Purchases Ledger',
    tanglish: 'Purchases Ledger',
  },
  purchasesSubtitle: {
    ta: 'சரக்கு வரவு, சப்ளையர் பில்கள் மற்றும் கொள்முதல் விவரங்கள்',
    en: 'Supplier invoices, purchase bills, and stock inward tracking',
    tanglish: 'Stock varavu, supplier bills and purchase details',
  },
  inventoryTitle: {
    ta: 'சரக்கு இருப்பு மேலாண்மை',
    en: 'Inventory & Stock Management',
    tanglish: 'Inventory & Stock Management',
  },
  inventorySubtitle: {
    ta: 'பொருட்களின் இருப்பு, விலை, மற்றும் குறைவு எச்சரிக்கைகள்',
    en: 'Real-time stock levels, wholesale costs, margins & reorder alerts',
    tanglish: 'Stock levels, wholesale costs, margins and reorder alerts',
  },
  customersTitle: {
    ta: 'வாடிக்கையாளர்கள் & கடன் ஏடு',
    en: 'Customer Directory & Credit Khata',
    tanglish: 'Customers & Credit Khata',
  },
  customersSubtitle: {
    ta: 'வாடிக்கையாளர் விவரங்கள் மற்றும் கடன் நிலுவை கண்காணிப்பு',
    en: 'Customer accounts, contact directory, and outstanding credit balances',
    tanglish: 'Customer details and outstanding credit tracking',
  },
  suppliersTitle: {
    ta: 'சப்ளையர்கள் & கொள்முதல் பாக்கிகள்',
    en: 'Supplier Directory & Payables',
    tanglish: 'Suppliers & Payables',
  },
  suppliersSubtitle: {
    ta: 'மொத்த வியாபாரிகள் மற்றும் செலுத்த வேண்டிய தொகை',
    en: 'Vendor directory, order history, and pending supplier payables',
    tanglish: 'Vendor directory, order history and pending payables',
  },
  creditTitle: {
    ta: 'கடன் மேலாண்மை (Credit Khata)',
    en: 'Credit Ledger & Debt Collection',
    tanglish: 'Credit Ledger & Debt Collection',
  },
  creditSubtitle: {
    ta: 'வாடிக்கையாளர் வசூல்கள் மற்றும் சப்ளையர் பாக்கிகள்',
    en: 'Track receivables from customers and payables owed to vendors',
    tanglish: 'Customer receivables and supplier payables tracking',
  },
  expensesTitle: {
    ta: 'செலவு கணக்குகள்',
    en: 'Business Expenses',
    tanglish: 'Business Expenses',
  },
  expensesSubtitle: {
    ta: 'கடை வாடகை, சம்பளம், மின்சாரம் மற்றும் இதர செலவுகள்',
    en: 'Store rent, staff wages, electricity, transport & operating overheads',
    tanglish: 'Store rent, staff wages, electricity and operating expenses',
  },
  financialTitle: {
    ta: 'லாப நட்ட கணக்கீடு & நிதி நுண்ணறிவு',
    en: 'Profit & Loss and Financial Intelligence',
    tanglish: 'Profit & Loss & Financial Intelligence',
  },
  financialSubtitle: {
    ta: 'மொத்த வருவாய், நிகர லாபம் மற்றும் நிதி ஆரோக்கியம்',
    en: 'Gross revenue, net margin, breakeven, and business health diagnostics',
    tanglish: 'Gross revenue, net profit and business health metrics',
  },
  memoryTitle: {
    ta: 'வணிக நினைவகம்',
    en: 'Business Memory & Intelligence',
    tanglish: 'Business Memory & Intelligence',
  },
  memorySubtitle: {
    ta: 'வாடிக்கையாளர் பழக்கவழக்கங்கள் மற்றும் முக்கிய குறிப்புகள்',
    en: 'Customer buying preferences, operational notes, and AI insights',
    tanglish: 'Customer habits, operational notes and AI memory',
  },
  schemesTitle: {
    ta: 'அரசு திட்டங்கள் & மானியங்கள்',
    en: 'Government Schemes & Subsidies',
    tanglish: 'Government Schemes & Subsidies',
  },
  schemesSubtitle: {
    ta: 'சிறு வணிகர்களுக்கான மத்திய & தமிழ்நாடு அரசு நலத்திட்டங்கள்',
    en: 'Central & Tamil Nadu Government welfare, loans & subsidy programs for MSMEs',
    tanglish: 'Central & Tamil Nadu Government welfare loans and subsidies for MSMEs',
  },
  marketTitle: {
    ta: 'தமிழ்நாடு தினசரி சந்தை விலை நிலவரம்',
    en: 'Daily Mandi & Market Prices',
    tanglish: 'Daily Mandi & Market Prices',
  },
  marketSubtitle: {
    ta: 'கோயம்பேடு மற்றும் முக்கிய சந்தைகளின் தினசரி மொத்த விலை பட்டியல்',
    en: 'Daily wholesale market rates from Koyambedu, Ottanchathiram & TN APMC mandis',
    tanglish: 'Daily wholesale market rates from Koyambedu & TN APMC mandis',
  },
  alertsTitle: {
    ta: 'அறிவிப்புகள் மற்றும் எச்சரிக்கைகள்',
    en: 'Business Alerts & Notifications',
    tanglish: 'Business Alerts & Notifications',
  },
  alertsSubtitle: {
    ta: 'கடன் நிலுவை நினைவூட்டல் மற்றும் சரக்கு குறைவு தகவல்கள்',
    en: 'Credit collection reminders, low stock warnings, and business alerts',
    tanglish: 'Credit reminders, low stock warnings and store alerts',
  },
  reportsTitle: {
    ta: 'வணிக அறிக்கைகள் & கணக்கு ஏடுகள்',
    en: 'Business Reports & Financial Exports',
    tanglish: 'Business Reports & Financial Exports',
  },
  reportsSubtitle: {
    ta: 'விற்பனை, கொள்முதல், ஜிஎஸ்டி மற்றும் வரி கணக்கீடுகள்',
    en: 'Sales summary, purchases ledger, GST breakdown, and tax reports',
    tanglish: 'Sales summary, purchase ledger, GST breakdown and tax reports',
  },
  settingsTitle: {
    ta: 'அமைப்புகள் & சுயவிவரம்',
    en: 'Settings & Business Profile',
    tanglish: 'Settings & Business Profile',
  },
  settingsSubtitle: {
    ta: 'உங்கள் கடையின் பெயர், முகவரி, மொழி மற்றும் AI உள்ளமைவுகள்',
    en: 'Store name, contact info, default language, and AI configurations',
    tanglish: 'Store name, address, language and AI configurations',
  },
  assistantTitle: {
    ta: 'உரிமையாளர் AI வணிக ஆலோசகர்',
    en: 'Urimaiyalar AI Business Brain',
    tanglish: 'Urimaiyalar AI Business Brain',
  },
  assistantSubtitle: {
    ta: 'குரல் அல்லது எழுத்து மூலம் உங்கள் கடையின் முழு கணக்குகளையும் கேளுங்கள்',
    en: 'Ask anything about sales, credits, inventory or schemes in English, Tamil or Tanglish',
    tanglish: 'Ask anything about sales, credits, inventory or schemes via voice or text',
  },

  // Voice Modal
  voiceAssistant: {
    ta: 'குரல் உதவியாளர் (Voice)',
    en: 'Voice Assistant',
    tanglish: 'Voice Assistant',
  },
  voiceModalTitle: {
    ta: 'உரிமையாளர் AI குரல் உதவியாளர்',
    en: 'Urimaiyalar AI Voice Assistant',
    tanglish: 'Urimaiyalar AI Voice Assistant',
  },
  voiceModalSubtitle: {
    ta: 'தமிழில் அல்லது ஆங்கிலத்தில் பேசுங்கள் - நேரடி வணிக நுண்ணறிவு',
    en: 'Speak in English, Tamil or Tanglish for instant business intelligence',
    tanglish: 'Speak in English, Tamil or Tanglish for instant business intelligence',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'ta',
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  isTamil: true,
  isEnglish: false,
  isTanglish: false,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('ta');

  useEffect(() => {
    const saved = localStorage.getItem('urimaiyalar_lang') as Language;
    if (saved && ['ta', 'en', 'tanglish'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('urimaiyalar_lang', lang);
  };

  const t = (key: string, fallback?: string): string => {
    const entry = translations[key];
    if (entry && entry[language]) {
      return entry[language];
    }
    if (entry) {
      if (language === 'tanglish' && entry.tanglish) return entry.tanglish;
      if (entry.en) return entry.en;
      if (entry.ta) return entry.ta;
    }
    return fallback !== undefined ? fallback : key;
  };

  const isTamil = language === 'ta';
  const isEnglish = language === 'en';
  const isTanglish = language === 'tanglish';

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isTamil,
        isEnglish,
        isTanglish,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
