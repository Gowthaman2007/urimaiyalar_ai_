import React, { useState, useEffect } from 'react';
import { PackagePlus, Plus, Search, CheckCircle, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { Purchase, Product, Supplier } from '../../types';
import { Modal } from '../common/Modal';
import { useLanguage } from '../../context/LanguageContext';

interface PurchasesViewProps {
  isModalOpen: boolean;
  onCloseModal: () => void;
  onOpenModal: () => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  isModalOpen,
  onCloseModal,
  onOpenModal,
}) => {
  const { language, t, isEnglish, isTanglish } = useLanguage();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Form State
  const [billNumber, setBillNumber] = useState<string>(`PUR-${Date.now().toString().slice(-4)}`);
  const [supplierId, setSupplierId] = useState<string>('');
  const [supplierName, setSupplierName] = useState<string>('');
  const [supplierPhone, setSupplierPhone] = useState<string>('');
  const [items, setItems] = useState<
    Array<{
      productId: string;
      productName: string;
      unit: string;
      quantity: number;
      unitCost: number;
      subtotal: number;
    }>
  >([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CREDIT' | 'BANK_TRANSFER'>('CASH');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [purData, prodData, supData] = await Promise.all([
        api.getPurchases(100),
        api.getProducts(),
        api.getSuppliers(),
      ]);
      const safePurchases = Array.isArray(purData)
        ? purData
        : (purData && Array.isArray((purData as any).purchases)
        ? (purData as any).purchases
        : []);
      setPurchases(safePurchases);
      setProducts(Array.isArray(prodData) ? prodData : []);
      setSuppliers(Array.isArray(supData) ? supData : []);
    } catch (err) {
      console.error('Failed to load purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSupplierSelect = (id: string) => {
    setSupplierId(id);
    const sup = suppliers.find((s) => s.id === id);
    if (sup) {
      setSupplierName(sup.name);
      setSupplierPhone(sup.phone);
    }
  };

  const handleAddItem = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    setItems([
      ...items,
      {
        productId: prod.id,
        productName: prod.tamilName ? `${prod.tamilName} (${prod.name})` : prod.name,
        unit: prod.unit,
        quantity: 10,
        unitCost: prod.purchasePrice,
        subtotal: 10 * prod.purchasePrice,
      },
    ]);
  };

  const handleUpdateItem = (idx: number, qty: number, cost: number) => {
    const updated = [...items];
    updated[idx].quantity = qty;
    updated[idx].unitCost = cost;
    updated[idx].subtotal = qty * cost;
    setItems(updated);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  useEffect(() => {
    if (paymentMethod === 'CASH' || paymentMethod === 'UPI' || paymentMethod === 'BANK_TRANSFER') {
      setPaidAmount(totalAmount);
    } else {
      setPaidAmount(0);
    }
  }, [totalAmount, paymentMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName || items.length === 0) {
      alert('சப்ளையர் பெயர் மற்றும் பொருட்களை உள்ளிடவும்.');
      return;
    }

    setSubmitting(true);
    try {
      const creditAmt = Math.max(0, totalAmount - paidAmount);
      await api.createPurchase({
        billNumber,
        supplierId: supplierId || undefined,
        supplierName,
        supplierPhone,
        items,
        paidAmount,
        creditAmount: creditAmt,
        paymentMethod,
      });

      setItems([]);
      setSupplierId('');
      setSupplierName('');
      setBillNumber(`PUR-${Date.now().toString().slice(-4)}`);
      onCloseModal();
      loadData();
    } catch (err: any) {
      alert(err.message || 'கொள்முதல் பதிவில் தோல்வி');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = (Array.isArray(purchases) ? purchases : []).filter(
    (p) =>
      p.billNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{isEnglish ? 'Purchase Invoices' : isTanglish ? 'Purchase Bills' : 'கொள்முதல் ஏடு'}</span>
            <span className="text-emerald-600 font-serif">•</span>
            <span className="text-slate-500 text-sm font-normal">
              {isEnglish ? 'Vendor Invoices' : 'Purchase Bills'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEnglish
              ? 'Supplier invoices, inwards logistics, and stock replenishment'
              : isTanglish
              ? 'Supplier bills and stock add pandradhu'
              : 'சப்ளையர் பில்கள் மற்றும் சரக்கு இருப்பு சேர்க்கை'}
          </p>
        </div>

        <button
          id="purchases-create-btn"
          onClick={onOpenModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {isEnglish ? 'New Purchase' : isTanglish ? 'New Purchase' : 'புதிய கொள்முதல் (New Purchase)'}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-100 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            id="purchases-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              isEnglish
                ? 'Search invoice or supplier name...'
                : isTanglish
                ? 'Search bill or supplier...'
                : 'பில் அல்லது சப்ளையர் பெயர் தேடுக...'
            }
            className="flex-1 bg-transparent text-xs focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-3.5 pl-5">{isEnglish ? 'Bill No' : 'பில் எண்'}</th>
                <th className="p-3.5">{isEnglish ? 'Date' : 'நாள்'}</th>
                <th className="p-3.5">{isEnglish ? 'Supplier' : 'சப்ளையர்'}</th>
                <th className="p-3.5">{isEnglish ? 'Items' : 'பொருட்கள்'}</th>
                <th className="p-3.5">{isEnglish ? 'Method' : 'முறை'}</th>
                <th className="p-3.5 text-right">{isEnglish ? 'Total Amount' : 'மொத்த தொகை'}</th>
                <th className="p-3.5 text-right">{isEnglish ? 'Paid' : 'செலுத்தியது'}</th>
                <th className="p-3.5 text-right pr-5">{isEnglish ? 'Payable Due' : 'கடன் பாக்கி'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3.5 pl-5 font-mono font-bold text-slate-800">{p.billNumber}</td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">{p.supplierName}</td>
                    <td className="p-3.5 text-slate-500">
                      {p.items.length} {isEnglish ? 'items' : 'பொருட்கள்'}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-[10px]">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-slate-900">
                      ₹{p.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-right font-medium text-emerald-700">
                      ₹{p.paidAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-right pr-5 font-bold text-indigo-600">
                      {p.creditAmount > 0 ? `₹${p.creditAmount.toLocaleString('en-IN')}` : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    {isEnglish ? 'No purchase records found' : 'கொள்முதல் பதிவுகள் எதுவும் இல்லை'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        title={
          isEnglish
            ? 'Record Purchase Invoice'
            : isTanglish
            ? 'Record Purchase Bill'
            : 'புதிய கொள்முதல் பில் பதிவு (Record Purchase)'
        }
        subtitle={
          isEnglish
            ? 'Stock levels will automatically increase upon adding items.'
            : isTanglish
            ? 'Stock will automatically increase when items are added.'
            : 'பொருட்களைச் சேர்த்தவுடன் சரக்கு இருப்பு தானாகவே அதிகரிக்கும்.'
        }
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEnglish ? 'Bill / Invoice No' : 'பில் எண் (Invoice No)'}
              </label>
              <input
                type="text"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEnglish ? 'Select Supplier' : 'சப்ளையர் தேர்வு'}
              </label>
              <select
                value={supplierId}
                onChange={(e) => handleSupplierSelect(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <option value="">
                  {isEnglish ? '-- Direct Supplier / Walk-in --' : '-- நேரடி சப்ளையர் / பிறர் --'}
                </option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({isEnglish ? 'Due' : 'பாக்கி'}: ₹{s.outstandingPayable})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEnglish ? 'Supplier Name' : 'சப்ளையர் பெயர்'}
              </label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder={isEnglish ? 'Supplier name...' : 'சப்ளையர் பெயர்...'}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isEnglish ? 'Click to Add Product:' : 'பொருள் சேர்க்க:'}
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleAddItem(p.id)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium hover:border-indigo-500"
                >
                  + {isEnglish ? p.name : p.tamilName || p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Items table */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold">
                <tr>
                  <th className="p-2.5 pl-3">{isEnglish ? 'Product' : 'பொருள்'}</th>
                  <th className="p-2.5 w-24">{isEnglish ? 'Quantity' : 'அளவு (Qty)'}</th>
                  <th className="p-2.5 w-24">{isEnglish ? 'Unit Cost' : 'விலை அடக்கம் (Cost)'}</th>
                  <th className="p-2.5 w-24 text-right">{isEnglish ? 'Total' : 'கூட்டுத்தொகை'}</th>
                  <th className="p-2.5 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 pl-3 font-semibold">{item.productName}</td>
                    <td className="p-2.5">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(idx, parseInt(e.target.value, 10) || 1, item.unitCost)}
                        className="w-16 px-2 py-1 bg-white border border-slate-200 rounded-lg"
                      />
                    </td>
                    <td className="p-2.5">
                      <input
                        type="number"
                        min="0"
                        value={item.unitCost}
                        onChange={(e) => handleUpdateItem(idx, item.quantity, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg"
                      />
                    </td>
                    <td className="p-2.5 text-right font-bold">₹{item.subtotal.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => setItems(items.filter((_, i) => i !== idx))}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEnglish ? 'Payment Method' : 'செலுத்தும் முறை'}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <option value="CASH">{isEnglish ? 'Cash' : 'ரொக்கம் (Cash)'}</option>
                <option value="UPI">UPI</option>
                <option value="CREDIT">{isEnglish ? 'Supplier Credit' : 'கடன் பாக்கி (Credit)'}</option>
                <option value="BANK_TRANSFER">{isEnglish ? 'Bank Transfer' : 'வங்கி பரிமாற்றம் (Bank Transfer)'}</option>
              </select>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                {isEnglish ? 'Total Purchase Amount:' : 'மொத்த கொள்முதல்:'}
              </span>
              <span className="text-base font-extrabold text-slate-900">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onCloseModal}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
            >
              {isEnglish ? 'Cancel' : 'ரத்து'}
            </button>
            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold shadow-md"
            >
              {isEnglish ? 'Save Purchase Invoice' : 'கொள்முதல் பதிவு செய் (Save Purchase)'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
