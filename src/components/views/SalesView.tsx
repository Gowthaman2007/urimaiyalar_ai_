import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  FileText,
  CheckCircle,
  IndianRupee,
  Trash2,
  Filter,
} from 'lucide-react';
import { api } from '../../services/api';
import { Sale, Product, Customer } from '../../types';
import { Modal } from '../common/Modal';
import { useLanguage } from '../../context/LanguageContext';

interface SalesViewProps {
  isNewSaleModalOpen: boolean;
  onCloseNewSaleModal: () => void;
  onOpenNewSaleModal: () => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  isNewSaleModalOpen,
  onCloseNewSaleModal,
  onOpenNewSaleModal,
}) => {
  const { language, t, isEnglish, isTanglish } = useLanguage();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // New Sale Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [saleItems, setSaleItems] = useState<
    Array<{
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      purchasePrice: number;
      unit: string;
      subtotal: number;
    }>
  >([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CREDIT' | 'SPLIT'>('CASH');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [salesData, prodData, custData] = await Promise.all([
        api.getSales(100),
        api.getProducts(),
        api.getCustomers(),
      ]);
      const safeSales = Array.isArray(salesData)
        ? salesData
        : (salesData && Array.isArray((salesData as any).sales)
        ? (salesData as any).sales
        : []);
      setSales(safeSales);
      setProducts(Array.isArray(prodData) ? prodData : []);
      setCustomers(Array.isArray(custData) ? custData : []);
    } catch (err) {
      console.error('Failed to load sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSaleItem = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existingIndex = saleItems.findIndex((item) => item.productId === productId);
    if (existingIndex > -1) {
      const updated = [...saleItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setSaleItems(updated);
    } else {
      setSaleItems([
        ...saleItems,
        {
          productId: product.id,
          productName: product.tamilName ? `${product.tamilName} (${product.name})` : product.name,
          quantity: 1,
          unitPrice: product.sellingPrice,
          purchasePrice: product.purchasePrice,
          unit: product.unit,
          subtotal: product.sellingPrice,
        },
      ]);
    }
  };

  const handleUpdateItemQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setSaleItems(saleItems.filter((_, i) => i !== index));
      return;
    }
    const updated = [...saleItems];
    updated[index].quantity = newQty;
    updated[index].subtotal = newQty * updated[index].unitPrice;
    setSaleItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const grossTotal = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
  const netTotal = Math.max(0, grossTotal - discountAmount);

  // Auto-sync paid amount when net total changes and method is CASH or UPI
  useEffect(() => {
    if (paymentMethod === 'CASH' || paymentMethod === 'UPI') {
      setPaidAmount(netTotal);
    } else if (paymentMethod === 'CREDIT') {
      setPaidAmount(0);
    }
  }, [netTotal, paymentMethod]);

  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    const cust = customers.find((c) => c.id === id);
    if (cust) {
      setCustomerName(cust.name);
      setCustomerPhone(cust.phone);
    }
  };

  const handleSubmitSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saleItems.length === 0) {
      alert('தயவுசெய்து ஒரு பொருளையாவது சேர்க்கவும்.');
      return;
    }

    setSubmitting(true);
    try {
      const creditAmt = Math.max(0, netTotal - paidAmount);
      await api.createSale({
        customerId: selectedCustomerId || undefined,
        customerName: customerName || 'ரொக்க வாடிக்கையாளர் (Cash Customer)',
        customerPhone: customerPhone || undefined,
        items: saleItems,
        discountAmount,
        taxAmount: 0,
        paymentMethod,
        paidAmount,
        creditAmount: creditAmt,
        notes,
      });

      // Reset
      setSaleItems([]);
      setSelectedCustomerId('');
      setCustomerName('');
      setCustomerPhone('');
      setDiscountAmount(0);
      setPaidAmount(0);
      setNotes('');
      onCloseNewSaleModal();
      loadData();
    } catch (err: any) {
      alert(err.message || 'விற்பனை பதிவு செய்வதில் தோல்வி');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSales = (Array.isArray(sales) ? sales : []).filter(
    (s) =>
      s.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{isEnglish ? 'Sales Invoices' : isTanglish ? 'Sales Invoices' : 'விற்பனை ஏடு'}</span>
            <span className="text-emerald-600 font-serif">•</span>
            <span className="text-slate-500 text-sm font-normal">
              {isEnglish ? 'Live Store Ledger' : 'Sales Invoices'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEnglish
              ? 'Billing, automatic stock reduction and cash/credit sales ledger'
              : isTanglish
              ? 'Bill podudhal, automatic stock deduction and cash/credit tracking'
              : 'பில் போடுதல், சரக்கு தானியங்கி கழிவு மற்றும் ரொக்க/கடன் கணக்கு'}
          </p>
        </div>

        <button
          id="sales-create-btn"
          onClick={onOpenNewSaleModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {isEnglish ? 'New Sale Invoice' : isTanglish ? 'New Sale Bill' : 'புதிய விற்பனை பில் (New Sale)'}
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 flex items-center gap-2 shadow-xs">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input
          type="text"
          id="sales-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            isEnglish
              ? 'Search invoice number or customer name...'
              : isTanglish
              ? 'Search invoice number or customer...'
              : 'பில் எண் அல்லது வாடிக்கையாளர் பெயர் மூலம் தேடுக...'
          }
          className="flex-1 bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5 pl-5">{isEnglish ? 'Invoice No' : 'பில் எண்'}</th>
                <th className="p-3.5">{isEnglish ? 'Date' : 'நாள் (Date)'}</th>
                <th className="p-3.5">{isEnglish ? 'Customer' : 'வாடிக்கையாளர்'}</th>
                <th className="p-3.5">{isEnglish ? 'Items' : 'பொருட்கள்'}</th>
                <th className="p-3.5">{isEnglish ? 'Payment Method' : 'செலுத்தும் முறை'}</th>
                <th className="p-3.5 text-right">{isEnglish ? 'Total Amount' : 'மொத்த தொகை'}</th>
                <th className="p-3.5 text-right">{isEnglish ? 'Paid Amount' : 'செலுத்தியது'}</th>
                <th className="p-3.5 text-right pr-5">{isEnglish ? 'Credit Balance' : 'கடன் (Credit)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredSales.length > 0 ? (
                filteredSales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 pl-5 font-mono font-bold text-emerald-800">
                      {s.invoiceNumber}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(s.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {s.customerName}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {s.items.length} {isEnglish ? 'items' : 'பொருட்கள்'}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          s.paymentMethod === 'CASH'
                            ? 'bg-emerald-100 text-emerald-800'
                            : s.paymentMethod === 'UPI'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900">
                      ₹{s.netAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-right font-medium text-emerald-700">
                      ₹{s.paidAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-right pr-5 font-bold text-amber-600">
                      {s.creditAmount > 0 ? `₹${s.creditAmount.toLocaleString('en-IN')}` : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    {isEnglish ? 'No sales records found' : 'விற்பனை பதிவுகள் எதுவும் இல்லை'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Sale Modal */}
      <Modal
        isOpen={isNewSaleModalOpen}
        onClose={onCloseNewSaleModal}
        title={
          isEnglish
            ? 'Create New Sale Invoice'
            : isTanglish
            ? 'Create New Sale Bill'
            : 'புதிய விற்பனை பில் உருவாக்குதல் (Create Sale Invoice)'
        }
        subtitle={
          isEnglish
            ? 'Select customer and products. Inventory will automatically update.'
            : isTanglish
            ? 'Select customer and products. Stock will be auto-deducted.'
            : 'பொருட்களைத் தேர்ந்தெடுத்து பில் போடவும். சரக்கு இருப்பு தானாகவே குறையும்.'
        }
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitSale} className="space-y-4">
          {/* Customer Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEnglish
                  ? 'Select Customer (Optional)'
                  : isTanglish
                  ? 'Select Customer (Optional)'
                  : 'வாடிக்கையாளர் தேர்வு (Existing Customer)'}
              </label>
              <select
                id="sale-customer-select"
                value={selectedCustomerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">
                  {isEnglish
                    ? '-- Direct Cash Customer --'
                    : isTanglish
                    ? '-- Direct Cash Customer --'
                    : '-- நேரடி ரொக்க வாடிக்கையாளர் --'}
                </option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone || 'No phone'}) - {isEnglish ? 'Due' : 'நிலுவை'}: ₹{c.outstandingCredit}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEnglish ? 'Customer Name / Phone' : 'வாடிக்கையாளர் பெயர் / தொலைபேசி'}
              </label>
              <input
                type="text"
                id="sale-customer-name-input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={
                  isEnglish
                    ? 'Cash customer or customer name...'
                    : 'ரொக்க வாடிக்கையாளர் அல்லது பெயர்...'
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Product Quick Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isEnglish
                ? 'Click to Add Product:'
                : isTanglish
                ? 'Click to Add Product:'
                : 'பொருள் சேர்க்க (Click to Add Product):'}
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  id={`sale-add-prod-${p.id}`}
                  onClick={() => handleAddSaleItem(p.id)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 hover:border-emerald-500 hover:text-emerald-700 text-slate-700 text-xs font-medium transition-all shadow-2xs"
                >
                  {isEnglish ? p.name : p.tamilName || p.name} (₹{p.sellingPrice})
                </button>
              ))}
            </div>
          </div>

          {/* Selected Items Table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold">
                <tr>
                  <th className="p-2.5 pl-3">{isEnglish ? 'Product' : 'பொருள்'}</th>
                  <th className="p-2.5 w-24">{isEnglish ? 'Quantity' : 'அளவு (Qty)'}</th>
                  <th className="p-2.5 w-24">{isEnglish ? 'Price' : 'விலை'}</th>
                  <th className="p-2.5 w-24 text-right">{isEnglish ? 'Total' : 'கூட்டுத்தொகை'}</th>
                  <th className="p-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {saleItems.length > 0 ? (
                  saleItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 pl-3 font-semibold text-slate-800">
                        {item.productName}
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItemQty(idx, parseInt(e.target.value, 10) || 1)}
                          className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </td>
                      <td className="p-2.5 font-medium text-slate-700">₹{item.unitPrice}</td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        ₹{item.subtotal.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400 text-xs">
                      {isEnglish
                        ? 'Click products from above buttons to add them to invoice'
                        : 'பொருட்களை மேலே உள்ள பட்டன்களிலிருந்து கிளிக் செய்து சேர்க்கவும்'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Payment & Settlement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEnglish ? 'Payment Method' : 'செலுத்தும் முறை (Payment Method)'}
              </label>
              <select
                id="sale-payment-method-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="CASH">{isEnglish ? 'Cash' : 'ரொக்கம் (Cash)'}</option>
                <option value="UPI">{isEnglish ? 'UPI (GPay / PhonePe)' : 'Google Pay / PhonePe (UPI)'}</option>
                <option value="CREDIT">{isEnglish ? 'Credit Khata' : 'கடன் / பாக்கி (Credit Ledger)'}</option>
                <option value="SPLIT">{isEnglish ? 'Split (Part Cash / Part Credit)' : 'பகுதி பணம் / மீதி கடன் (Split)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEnglish ? 'Discount (₹)' : 'தள்ளுபடி (Discount ₹)'}
              </label>
              <input
                type="number"
                min="0"
                id="sale-discount-input"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              />
            </div>
          </div>

          {/* Calculation summary */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>{isEnglish ? 'Subtotal:' : 'மொத்த கூட்டுத்தொகை:'}</span>
              <span className="font-semibold">₹{grossTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{isEnglish ? 'Discount:' : 'தள்ளுபடி:'}</span>
              <span>-₹{discountAmount}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-emerald-950 pt-1 border-t border-emerald-200">
              <span>{isEnglish ? 'Net Total Invoice:' : 'நிகர பில் தொகை (Net Total):'}</span>
              <span>₹{netTotal.toLocaleString('en-IN')}</span>
            </div>
            {paymentMethod === 'SPLIT' && (
              <div className="pt-2 flex items-center justify-between">
                <span className="font-bold text-slate-700">
                  {isEnglish ? 'Amount Paid Now:' : 'இப்போது செலுத்திய தொகை:'}
                </span>
                <input
                  type="number"
                  min="0"
                  max={netTotal}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-28 px-2 py-1 bg-white border border-slate-300 rounded-lg font-bold text-xs"
                />
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCloseNewSaleModal}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              {isEnglish ? 'Cancel' : 'ரத்து'}
            </button>
            <button
              type="submit"
              id="sale-submit-btn"
              disabled={submitting || saleItems.length === 0}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isEnglish ? 'Confirm & Create Invoice' : 'பில் உறுதி செய்க (Create Invoice)'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
