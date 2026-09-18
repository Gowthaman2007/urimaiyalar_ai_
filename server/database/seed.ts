import bcrypt from 'bcryptjs';
import { db } from './db';
import {
  GovernmentScheme,
  MarketIndicator,
  User,
  Business,
  Product,
  Customer,
  Supplier,
  Sale,
  Purchase,
  Expense,
  CreditTransaction,
  InventoryTransaction,
  BusinessMemory,
  Alert
} from '../types';

export const INITIAL_SCHEMES: GovernmentScheme[] = [
  {
    id: 'scheme-needs',
    name: 'New Entrepreneur cum Enterprise Development Scheme (NEEDS)',
    tamilName: 'புதிய தொழில்முனைவோர் மற்றும் நிறுவன மேம்பாட்டுத் திட்டம் (NEEDS)',
    code: 'TN-NEEDS-2026',
    agency: 'TAMIL_NADU_GOVT',
    businessCategory: ['Manufacturing', 'Service', 'Food Processing', 'Retail Technology'],
    eligibility: 'First generation entrepreneurs aged 21-35 (up to 45 for special category) with Degree/Diploma/ITI. Project cost ₹10 Lakh to ₹5 Crore.',
    eligibilityTamil: 'முதல் தலைமுறை தொழில்முனைவோர், வயது 21-35 (சிறப்புப் பிரிவினருக்கு 45 வரை). பட்டப்படிப்பு அல்லது டிப்ளமோ தேர்ச்சி பெற்றிருக்க வேண்டும்.',
    subsidyOrLoan: '25% Capital Subsidy + 3% Interest Subvention',
    subsidyPercentage: '25%',
    maxAmount: '₹75,00,000 (Subsidy cap)',
    requiredDocuments: [
      'Degree / Diploma Certificate',
      'Detailed Project Report (DPR)',
      'Aadhaar Card & Community Certificate',
      'Bank Consent Letter',
      'Land/Building lease agreement or ownership'
    ],
    applicationProcess: 'Apply online via MSME online portal (msmeonline.tn.gov.in) and attend District Task Force Committee interview at District Industries Centre (DIC).',
    portalUrl: 'https://msmeonline.tn.gov.in/needs/',
    lastUpdated: '2026-03-01',
    active: true
  },
  {
    id: 'scheme-uyegp',
    name: 'Unemployed Youth Employment Generation Programme (UYEGP)',
    tamilName: 'வேலையில்லா இளைஞர்களுக்கான வேலைவாய்ப்பு உருவாக்கும் திட்டம் (UYEGP)',
    code: 'TN-UYEGP-2026',
    agency: 'TAMIL_NADU_GOVT',
    businessCategory: ['Retail Stores', 'Manufacturing', 'Service Sector', 'Grocery'],
    eligibility: 'Minimum 8th pass, age 18-35 (45 for women/SC/ST/MBC/BC). Family annual income less than ₹5,00,000.',
    eligibilityTamil: 'குறைந்தபட்சம் 8-ஆம் வகுப்பு தேர்ச்சி, வயது 18-35 (மகளிர், பிற்படுத்தப்பட்டோருக்கு 45 வரை). குடும்ப ஆண்டு வருமானம் ₹5 லட்சத்திற்குள் இருக்க வேண்டும்.',
    subsidyOrLoan: '25% Government Subsidy',
    subsidyPercentage: '25%',
    maxAmount: '₹15,00,000 (Manufacturing), ₹5,00,000 (Service/Business)',
    requiredDocuments: [
      '8th/10th Marksheet or Transfer Certificate',
      'Ration Card / Family Card',
      'Aadhaar Card',
      'Quotation for Machinery/Stock',
      'Income Certificate'
    ],
    applicationProcess: 'Submit application through DIC Tamil Nadu portal. Interview at DIC office, then bank disburses loan with 25% front-ended subsidy.',
    portalUrl: 'https://msmeonline.tn.gov.in/uyegp/',
    lastUpdated: '2026-02-15',
    active: true
  },
  {
    id: 'scheme-mudra',
    name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    tamilName: 'பிரதான் மந்திரி முத்ரா கடன் திட்டம்',
    code: 'CENTRAL-MUDRA-2026',
    agency: 'CENTRAL_GOVT',
    businessCategory: ['Micro Enterprise', 'Retailer', 'Trader', 'Artisans', 'Small Transport'],
    eligibility: 'Any Indian citizen owning or starting a non-farm small business. No collateral required.',
    eligibilityTamil: 'விவசாயம் அல்லாத சிறு தொழில் மற்றும் கடை வைத்திருக்கும் எந்தவொரு இந்திய குடிமகனும் விண்ணப்பிக்கலாம். அடமானம் எதுவும் தேவையில்லை.',
    subsidyOrLoan: 'Collateral-free Institutional Bank Loan (Shishu up to 50k, Kishore up to 5L, Tarun up to 10L, Tarun Plus up to 20L)',
    maxAmount: '₹20,00,000',
    requiredDocuments: [
      'Proof of Identity (Aadhaar / Voter ID)',
      'Proof of Residence',
      'Business Registration / Trade License',
      'Bank statement for last 6 months',
      'Quotation of machinery or inventory items'
    ],
    applicationProcess: 'Apply via Udyamimitra portal (udyamimitra.in) or visit any nationalized bank or NBFC with business KYC.',
    portalUrl: 'https://www.mudra.org.in/',
    lastUpdated: '2026-01-20',
    active: true
  },
  {
    id: 'scheme-pm-svanidhi',
    name: 'PM Street Vendor\'s AtmaNirbhar Nidhi (PM SVANidhi)',
    tamilName: 'பிரதமர் ஸ்வாநிதி - சிறு வியாபாரிகளுக்கான மூலதன நிதி',
    code: 'CENTRAL-SVANIDHI-2026',
    agency: 'CENTRAL_GOVT',
    businessCategory: ['Street Vendors', 'Petty Shops', 'Mobile Carts', 'Vegetable Vendors'],
    eligibility: 'Street vendors and small shop owners engaged in vending before specified cutoff date.',
    eligibilityTamil: 'தெருவோர வியாபாரிகள் மற்றும் பெட்டிக் கடை வைத்திருப்போர்.',
    subsidyOrLoan: 'Working capital loan ₹10k (1st tranche), ₹20k (2nd tranche), ₹50k (3rd tranche) with 7% interest subsidy & cashback on digital transactions.',
    maxAmount: '₹50,000',
    requiredDocuments: [
      'Vending Certificate / Letter of Recommendation (LoR)',
      'Aadhaar Card linked to Mobile',
      'Active Bank Account with UPI'
    ],
    applicationProcess: 'Apply directly via pmsvanidhi.mohua.gov.in or through local municipality / CSC center.',
    portalUrl: 'https://pmsvanidhi.mohua.gov.in/',
    lastUpdated: '2026-02-10',
    active: true
  },
  {
    id: 'scheme-cgtmse',
    name: 'Credit Guarantee Trust for Micro and Small Enterprises (CGTMSE)',
    tamilName: 'சிறு தொழில்களுக்கான பிணையற்ற கடன் உத்தரவாதத் திட்டம் (CGTMSE)',
    code: 'SIDBI-CGTMSE-2026',
    agency: 'SIDBI',
    businessCategory: ['All MSMEs', 'Retailers', 'Wholesalers', 'Manufacturers'],
    eligibility: 'New and existing Micro and Small Enterprises seeking credit facilities without third-party guarantee or collateral security.',
    eligibilityTamil: 'சொத்து அடமானம் அல்லது மூன்றாம் நபர் உத்தரவாதம் இன்றி கடன் பெற விரும்பும் அனைத்து சிறு மற்றும் குறு தொழில் நிறுவனங்கள்.',
    subsidyOrLoan: 'Credit guarantee coverage up to 85% for micro enterprises and women entrepreneurs.',
    maxAmount: '₹5,00,00,000',
    requiredDocuments: [
      'Udyam Registration Certificate',
      'Income Tax Returns (ITR)',
      'Audited Financial Statements / GST Returns',
      'Business Project Proposal'
    ],
    applicationProcess: 'Approach Member Lending Institutions (Scheduled Commercial Banks, RRBs, NBFCs) requesting CGTMSE covered credit.',
    portalUrl: 'https://www.cgtmse.in/',
    lastUpdated: '2026-03-05',
    active: true
  }
];

export const INITIAL_MARKET_INDICATORS: MarketIndicator[] = [
  {
    id: 'mkt-ponni-rice',
    commodity: 'Ponni Boiled Rice (Deluxe Grade)',
    tamilName: 'பொன்னி புழுங்கல் அரிசி (முதல் ரகம்)',
    marketLocation: 'Madurai Mandi / Trichy APMC',
    unit: '25kg bag',
    currentPrice: 1450,
    previousPrice: 1420,
    changePercentage: 2.1,
    trend: 'UP',
    demandLevel: 'HIGH',
    updatedAt: new Date().toISOString(),
    notes: 'Paddy arrivals steady. Moderate price increase due to transport freight revision.'
  },
  {
    id: 'mkt-toor-dal',
    commodity: 'Toor Dal (Unpolished High Protein)',
    tamilName: 'துவரம் பருப்பு (அன்-பாலிஷ்டு)',
    marketLocation: 'Erode Mandi / Chennai Koyambedu',
    unit: '1kg',
    currentPrice: 148,
    previousPrice: 156,
    changePercentage: -5.1,
    trend: 'DOWN',
    demandLevel: 'HIGH',
    updatedAt: new Date().toISOString(),
    notes: 'New crop arrivals in domestic markets stabilizing wholesale supply.'
  },
  {
    id: 'mkt-sunflower-oil',
    commodity: 'Refined Sunflower Oil 15L Tin',
    tamilName: 'சூரியகாந்தி எண்ணெய் 15 லிட்டர் டின்',
    marketLocation: 'Chennai Wholesale Market',
    unit: '15 Litre Tin',
    currentPrice: 1720,
    previousPrice: 1715,
    changePercentage: 0.3,
    trend: 'STABLE',
    demandLevel: 'HIGH',
    updatedAt: new Date().toISOString(),
    notes: 'Port deliveries consistent, international palm oil futures stable.'
  },
  {
    id: 'mkt-groundnut-oil',
    commodity: 'Cold Pressed Groundnut Oil',
    tamilName: 'மரச்செக்கு நிலக்கடலை எண்ணெய்',
    marketLocation: 'Dindigul / Pollachi Mills',
    unit: '1 Litre',
    currentPrice: 210,
    previousPrice: 205,
    changePercentage: 2.4,
    trend: 'UP',
    demandLevel: 'MODERATE',
    updatedAt: new Date().toISOString(),
    notes: 'High retail consumer demand for cold pressed traditional oils.'
  },
  {
    id: 'mkt-small-onion',
    commodity: 'Small Shallots / Sambar Onion',
    tamilName: 'சின்ன வெங்காயம் (நாட்டு)',
    marketLocation: 'Ottanchathiram / Tiruppur APMC',
    unit: '1kg',
    currentPrice: 42,
    previousPrice: 48,
    changePercentage: -12.5,
    trend: 'DOWN',
    demandLevel: 'HIGH',
    updatedAt: new Date().toISOString(),
    notes: 'Heavy seasonal arrivals from Perambalur and Dindigul belts.'
  },
  {
    id: 'mkt-turmeric',
    commodity: 'Finger Turmeric (Erode Special)',
    tamilName: 'விரலி மஞ்சள் (ஈரோடு ஸ்பெஷல்)',
    marketLocation: 'Erode Regulated Market',
    unit: '1 Quintal (100kg)',
    currentPrice: 14800,
    previousPrice: 14200,
    changePercentage: 4.2,
    trend: 'UP',
    demandLevel: 'HIGH',
    updatedAt: new Date().toISOString(),
    notes: 'Strong domestic and export demand driving firm price realization.'
  }
];

export async function seedDatabaseIfEmpty() {
  // Always seed schemes and market indicators if empty
  if (db.governmentSchemes.length === 0) {
    db.setSchemes(INITIAL_SCHEMES);
  }
  if (db.marketIndicators.length === 0) {
    db.setMarketIndicators(INITIAL_MARKET_INDICATORS);
  }

  // Check if demo user already exists
  const existingUser = db.users.find(u => u.email === 'demo@urimaiyalar.ai');
  if (existingUser) {
    return;
  }

  console.log('Seeding initial demo business and user for URIMAIYALAR AI presentation...');

  const passwordHash = await bcrypt.hash('password123', 10);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterdayStr = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
  const twoDaysAgoStr = new Date(now.getTime() - 86400000 * 2).toISOString().split('T')[0];

  const demoUser: User = {
    id: 'user-demo-001',
    name: 'முருகேசன் வேலுச்சாமி (Murugesan V)',
    email: 'demo@urimaiyalar.ai',
    passwordHash,
    role: 'OWNER',
    phone: '9842100111',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
  db.saveUser(demoUser);

  const demoBusiness: Business = {
    id: 'biz-demo-001',
    userId: demoUser.id,
    businessName: 'ஸ்ரீ முருகன் மளிகை & ஜெனரல் ஸ்டோர்ஸ்',
    ownerName: 'முருகேசன் வேலுச்சாமி',
    businessType: 'Retail Grocery & Provisions',
    category: 'Grocery & General Store',
    phone: '9842100111',
    email: 'muruganstores.mdu@gmail.com',
    address: '14, மேல மாசி வீதி, மதுரை மெயின்',
    district: 'Madurai',
    state: 'Tamil Nadu',
    preferredLanguage: 'ta',
    currency: 'INR',
    gstin: '33AABCM1234F1Z2',
    isDemo: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
  db.saveBusiness(demoBusiness);

  // Products
  const products: Product[] = [
    {
      id: 'prod-001',
      businessId: demoBusiness.id,
      name: 'Ponni Raw Rice 25kg',
      tamilName: 'பொன்னி பச்சரிசி 25 கிலோ',
      sku: 'RICE-PON-25K',
      category: 'Grains & Rice',
      unit: 'bag',
      sellingPrice: 1450,
      purchasePrice: 1280,
      currentStock: 18,
      minimumStock: 10,
      supplierName: 'ABC Traders',
      status: 'ACTIVE',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'prod-002',
      businessId: demoBusiness.id,
      name: 'Aavin Fresh Milk 500ml',
      tamilName: 'ஆவின் பால் 500மி.லி',
      sku: 'MILK-AAV-500M',
      category: 'Dairy',
      unit: 'packet',
      sellingPrice: 25,
      purchasePrice: 22,
      currentStock: 4, // Low stock on purpose!
      minimumStock: 15,
      supplierName: 'Sri Lakshmi Stores',
      status: 'ACTIVE',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'prod-003',
      businessId: demoBusiness.id,
      name: 'Sunland Refined Sunflower Oil 1L',
      tamilName: 'சன்லேண்ட் சூரியகாந்தி எண்ணெய் 1லி',
      sku: 'OIL-SUN-1L',
      category: 'Cooking Oils',
      unit: 'packet',
      sellingPrice: 135,
      purchasePrice: 118,
      currentStock: 22,
      minimumStock: 8,
      supplierName: 'ABC Traders',
      status: 'ACTIVE',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'prod-004',
      businessId: demoBusiness.id,
      name: 'Hamam Neem Bath Soap 100g',
      tamilName: 'ஹமாம் வேம்பு சோப் 100கி',
      sku: 'SOAP-HAM-100G',
      category: 'Personal Care',
      unit: 'piece',
      sellingPrice: 38,
      purchasePrice: 31,
      currentStock: 5, // Low stock on purpose!
      minimumStock: 12,
      supplierName: 'Sri Lakshmi Stores',
      status: 'ACTIVE',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'prod-005',
      businessId: demoBusiness.id,
      name: 'Britannia Marie Gold 250g',
      tamilName: 'பிரிட்டானியா மேரி கோல்ட் 250கி',
      sku: 'BIS-MARIE-250G',
      category: 'Snacks & Biscuits',
      unit: 'packet',
      sellingPrice: 35,
      purchasePrice: 28,
      currentStock: 30,
      minimumStock: 10,
      supplierName: 'Sri Lakshmi Stores',
      status: 'ACTIVE',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'prod-006',
      businessId: demoBusiness.id,
      name: 'First Grade Toor Dal 1kg',
      tamilName: 'முதல் தரம் துவரம் பருப்பு 1கிலோ',
      sku: 'DAL-TOOR-1K',
      category: 'Pulses & Dals',
      unit: 'kg',
      sellingPrice: 160,
      purchasePrice: 142,
      currentStock: 2, // Critically low stock!
      minimumStock: 10,
      supplierName: 'ABC Traders',
      status: 'ACTIVE',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  products.forEach(p => db.saveProduct(p));

  // Customers
  const customers: Customer[] = [
    {
      id: 'cust-001',
      businessId: demoBusiness.id,
      name: 'Ravi (ரவி மளிகை வாடிக்கையாளர்)',
      phone: '9842154321',
      address: '22, தெற்கு பெருமாள் மேஸ்திரி வீதி, மதுரை',
      notes: 'Regular customer, pays weekly, good trust rating',
      totalPurchases: 18500,
      totalPaid: 16650,
      outstandingCredit: 1850,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'cust-002',
      businessId: demoBusiness.id,
      name: 'Kumar (குமார் டீ ஸ்டால்)',
      phone: '9789123456',
      address: 'மெயின் பஜார், மதுரை',
      notes: 'Takes milk, sugar and tea dust daily morning',
      totalPurchases: 14200,
      totalPaid: 13750,
      outstandingCredit: 450,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'cust-003',
      businessId: demoBusiness.id,
      name: 'Suresh (சுரேஷ் எலக்ட்ரிக்கல்ஸ்)',
      phone: '9443211223',
      address: 'காக்கா தோப்பு தெரு, மதுரை',
      notes: 'Full instant cash/UPI buyer',
      totalPurchases: 9400,
      totalPaid: 9400,
      outstandingCredit: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'cust-004',
      businessId: demoBusiness.id,
      name: 'Priya (பிரியா அக்கா)',
      phone: '9655432109',
      address: '3/12, வடக்கு வெளி வீதி, மதுரை',
      notes: 'Home provisions on monthly ledger',
      totalPurchases: 7800,
      totalPaid: 6880,
      outstandingCredit: 920,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  customers.forEach(c => db.saveCustomer(c));

  // Suppliers
  const suppliers: Supplier[] = [
    {
      id: 'supp-001',
      businessId: demoBusiness.id,
      name: 'ABC Traders (ஏபிசி டிரேடர்ஸ் - மொத்த மளிகை)',
      phone: '9843299887',
      address: 'திண்டுக்கல் மெயின் ரோடு, மதுரை',
      notes: 'Supplies Rice, Dals, Cooking Oils. Credit cycle 15 days.',
      totalPurchases: 65000,
      totalPaid: 50500,
      outstandingPayable: 14500,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      id: 'supp-002',
      businessId: demoBusiness.id,
      name: 'Sri Lakshmi Stores (ஸ்ரீ லட்சுமி ஏஜென்சி)',
      phone: '9442177665',
      address: 'கீழ ஆவணி மூல வீதி, மதுரை',
      notes: 'Supplies Packaged foods, Dairy, Soaps, Biscuits.',
      totalPurchases: 28000,
      totalPaid: 21800,
      outstandingPayable: 6200,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  suppliers.forEach(s => db.saveSupplier(s));

  // Sales (Today and Yesterday)
  const sales: Sale[] = [
    {
      id: 'sale-001',
      businessId: demoBusiness.id,
      invoiceNumber: 'INV-2026-001',
      customerId: customers[0].id,
      customerName: customers[0].name,
      customerPhone: customers[0].phone,
      items: [
        {
          productId: products[0].id,
          productName: products[0].name,
          unit: 'bag',
          quantity: 1,
          unitPrice: 1450,
          purchasePrice: 1280,
          subtotal: 1450
        },
        {
          productId: products[2].id,
          productName: products[2].name,
          unit: 'packet',
          quantity: 2,
          unitPrice: 135,
          purchasePrice: 118,
          subtotal: 270
        }
      ],
      totalAmount: 1720,
      discountAmount: 20,
      taxAmount: 0,
      netAmount: 1700,
      paymentMethod: 'CREDIT',
      paidAmount: 200,
      creditAmount: 1500,
      notes: 'Credit taken for grocery provision',
      createdAt: `${todayStr}T09:30:00.000Z`
    },
    {
      id: 'sale-002',
      businessId: demoBusiness.id,
      invoiceNumber: 'INV-2026-002',
      customerId: customers[1].id,
      customerName: customers[1].name,
      customerPhone: customers[1].phone,
      items: [
        {
          productId: products[1].id,
          productName: products[1].name,
          unit: 'packet',
          quantity: 10,
          unitPrice: 25,
          purchasePrice: 22,
          subtotal: 250
        }
      ],
      totalAmount: 250,
      discountAmount: 0,
      taxAmount: 0,
      netAmount: 250,
      paymentMethod: 'UPI',
      paidAmount: 250,
      creditAmount: 0,
      notes: 'GPay payment received',
      createdAt: `${todayStr}T10:15:00.000Z`
    },
    {
      id: 'sale-003',
      businessId: demoBusiness.id,
      invoiceNumber: 'INV-2026-003',
      customerId: customers[2].id,
      customerName: customers[2].name,
      customerPhone: customers[2].phone,
      items: [
        {
          productId: products[3].id,
          productName: products[3].name,
          unit: 'piece',
          quantity: 3,
          unitPrice: 38,
          purchasePrice: 31,
          subtotal: 114
        },
        {
          productId: products[4].id,
          productName: products[4].name,
          unit: 'packet',
          quantity: 2,
          unitPrice: 35,
          purchasePrice: 28,
          subtotal: 70
        }
      ],
      totalAmount: 184,
      discountAmount: 4,
      taxAmount: 0,
      netAmount: 180,
      paymentMethod: 'CASH',
      paidAmount: 180,
      creditAmount: 0,
      notes: 'Counter cash',
      createdAt: `${todayStr}T11:45:00.000Z`
    },
    {
      id: 'sale-004',
      businessId: demoBusiness.id,
      invoiceNumber: 'INV-2026-004',
      customerId: customers[3].id,
      customerName: customers[3].name,
      customerPhone: customers[3].phone,
      items: [
        {
          productId: products[0].id,
          productName: products[0].name,
          unit: 'bag',
          quantity: 1,
          unitPrice: 1450,
          purchasePrice: 1280,
          subtotal: 1450
        }
      ],
      totalAmount: 1450,
      discountAmount: 50,
      taxAmount: 0,
      netAmount: 1400,
      paymentMethod: 'SPLIT',
      paidAmount: 1000,
      creditAmount: 400,
      notes: 'Cash ₹1000 + ₹400 on monthly ledger',
      createdAt: `${yesterdayStr}T15:20:00.000Z`
    }
  ];

  sales.forEach(s => db.saveSale(s));

  // Purchases
  const purchases: Purchase[] = [
    {
      id: 'purch-001',
      businessId: demoBusiness.id,
      billNumber: 'BILL-ABC-4412',
      supplierId: suppliers[0].id,
      supplierName: suppliers[0].name,
      supplierPhone: suppliers[0].phone,
      items: [
        {
          productId: products[0].id,
          productName: products[0].name,
          unit: 'bag',
          quantity: 20,
          unitCost: 1280,
          subtotal: 25600
        },
        {
          productId: products[2].id,
          productName: products[2].name,
          unit: 'packet',
          quantity: 25,
          unitCost: 118,
          subtotal: 2950
        }
      ],
      totalAmount: 28550,
      paidAmount: 18550,
      creditAmount: 10000,
      paymentMethod: 'BANK_TRANSFER',
      notes: 'Rice lorry delivery unloaded at shop',
      createdAt: `${yesterdayStr}T08:30:00.000Z`
    }
  ];

  purchases.forEach(p => db.savePurchase(p));

  // Expenses
  const expenses: Expense[] = [
    {
      id: 'exp-001',
      businessId: demoBusiness.id,
      category: 'RENT',
      amount: 6500,
      paymentMethod: 'BANK_TRANSFER',
      description: 'Shop monthly rent paid to building owner',
      date: `${todayStr}`,
      createdAt: `${todayStr}T09:00:00.000Z`
    },
    {
      id: 'exp-002',
      businessId: demoBusiness.id,
      category: 'ELECTRICITY',
      amount: 1450,
      paymentMethod: 'UPI',
      description: 'TNEB commercial electricity bill for cooler and lights',
      date: `${yesterdayStr}`,
      createdAt: `${yesterdayStr}T11:00:00.000Z`
    },
    {
      id: 'exp-003',
      businessId: demoBusiness.id,
      category: 'TRANSPORT',
      amount: 600,
      paymentMethod: 'CASH',
      description: 'Auto freight fare for bringing stocks from Madurai central mandi',
      date: `${todayStr}`,
      createdAt: `${todayStr}T10:00:00.000Z`
    }
  ];

  expenses.forEach(e => db.saveExpense(e));

  // Credit Transactions
  const creditTxs: CreditTransaction[] = [
    {
      id: 'ctx-001',
      businessId: demoBusiness.id,
      entityType: 'CUSTOMER',
      entityId: customers[0].id,
      entityName: customers[0].name,
      type: 'CREDIT_GIVEN',
      amount: 1500,
      balanceAfter: 1850,
      paymentMethod: 'CREDIT',
      notes: 'Provision purchase credit on bill INV-2026-001',
      referenceSaleId: sales[0].id,
      createdAt: `${todayStr}T09:30:00.000Z`
    },
    {
      id: 'ctx-002',
      businessId: demoBusiness.id,
      entityType: 'CUSTOMER',
      entityId: customers[0].id,
      entityName: customers[0].name,
      type: 'PAYMENT_RECEIVED',
      amount: 500,
      balanceAfter: 1850, // previously was 2350
      paymentMethod: 'UPI',
      notes: 'Weekly partial settlement received via PhonePe',
      createdAt: `${yesterdayStr}T18:00:00.000Z`
    }
  ];

  creditTxs.forEach(c => db.saveCreditTransaction(c));

  // Business Memories
  const memories: BusinessMemory[] = [
    {
      id: 'mem-001',
      businessId: demoBusiness.id,
      type: 'FACT',
      title: 'Store Location & Specialization',
      content: 'Sri Murugan Groceries operates in Madurai Melamasi street, selling staple rice, dals, cooking oils, and daily essentials.',
      tamilContent: 'ஸ்ரீ முருகன் மளிகை மதுரை மேலமாசி வீதியில் அமைந்துள்ளது. பாரம்பரிய அரிசி ரகங்கள் மற்றும் தினசரி மளிகைப் பொருட்கள் விற்பனை செய்யப்படுகிறது.',
      source: 'USER_NOTE',
      importance: 'HIGH',
      metadata: { location: 'Madurai', established: 2018 },
      createdAt: `${twoDaysAgoStr}T10:00:00.000Z`
    },
    {
      id: 'mem-002',
      businessId: demoBusiness.id,
      type: 'PREFERENCE',
      title: 'Customer Ravi Credit Terms',
      content: 'Customer Ravi settles accounts every Saturday evening. His agreed credit limit is ₹3,000.',
      tamilContent: 'வாடிக்கையாளர் ரவி ஒவ்வொரு சனிக்கிழமை மாலையும் கணக்கை முடிப்பார். அவருடைய கடன் வரம்பு ₹3,000.',
      source: 'USER_NOTE',
      importance: 'HIGH',
      metadata: { customerId: customers[0].id, creditLimit: 3000 },
      createdAt: `${twoDaysAgoStr}T11:00:00.000Z`
    },
    {
      id: 'mem-003',
      businessId: demoBusiness.id,
      type: 'INSIGHT',
      title: 'Ponni Rice Sales Peak on Weekends',
      content: 'Ponni Raw Rice 25kg bags have the highest velocity on Friday and Saturday mornings.',
      tamilContent: 'பொன்னி பச்சரிசி 25 கிலோ பைகள் வெள்ளி மற்றும் சனிக்கிழமை காலையில் அதிகளவில் விற்பனையாகிறது.',
      source: 'SALES_ENGINE',
      importance: 'MEDIUM',
      metadata: { productId: products[0].id, peakDay: 'Saturday' },
      createdAt: `${yesterdayStr}T19:00:00.000Z`
    }
  ];

  memories.forEach(m => db.saveBusinessMemory(m));

  // Alerts
  const alerts: Alert[] = [
    {
      id: 'alt-001',
      businessId: demoBusiness.id,
      type: 'LOW_STOCK',
      severity: 'CRITICAL',
      title: 'துவரம் பருப்பு கையிருப்பு மிகவும் குறைவு!',
      message: 'First Grade Toor Dal 1kg has only 2 kg remaining (Minimum required: 10 kg). Restock today.',
      tamilMessage: 'துவரம் பருப்பு கையிருப்பு வெறும் 2 கிலோ மட்டுமே உள்ளது (குறைந்தபட்ச தேவை: 10 கிலோ). இன்றே ஆர்டர் செய்யவும்.',
      isRead: false,
      link: '/inventory',
      createdAt: `${todayStr}T08:00:00.000Z`
    },
    {
      id: 'alt-002',
      businessId: demoBusiness.id,
      type: 'LOW_STOCK',
      severity: 'WARNING',
      title: 'ஆவின் பால் இருப்பு குறைவு (Aavin Milk Low)',
      message: 'Aavin Milk 500ml has only 4 packets left. Restock before evening peak rush.',
      tamilMessage: 'ஆவின் பால் 500மி.லி 4 பாக்கெட்டுகள் மட்டுமே உள்ளன. மாலை வியாபாரத்திற்கு முன் வரவழைக்கவும்.',
      isRead: false,
      link: '/inventory',
      createdAt: `${todayStr}T10:00:00.000Z`
    },
    {
      id: 'alt-003',
      businessId: demoBusiness.id,
      type: 'CREDIT_OVERDUE',
      severity: 'INFO',
      title: 'வாடிக்கையாளர் ரவி நிலுவை ₹1,850',
      message: 'Customer Ravi has an outstanding credit balance of ₹1,850. Weekly reminder due tomorrow.',
      tamilMessage: 'வாடிக்கையாளர் ரவிக்கு ₹1,850 நிலுவைத் தொகை உள்ளது. சனிக்கிழமை வரவு நினைவூட்டல்.',
      isRead: false,
      link: '/credit',
      createdAt: `${todayStr}T09:35:00.000Z`
    }
  ];

  alerts.forEach(a => db.saveAlert(a));

  console.log('URIMAIYALAR AI demo data successfully seeded!');
}
