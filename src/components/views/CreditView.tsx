import React, { useState, useEffect } from 'react';
import { BookOpenCheck, Plus, Search, IndianRupee, MessageCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { api } from '../../services/api';
import { Customer, Supplier, CreditTransaction } from '../../types';
import { Modal } from '../common/Modal';
import { useLanguage } from '../../context/LanguageContext';

interface CreditViewProps {
  isPaymentModalOpen: boolean;
  onClosePaymentModal: () => void;
  onOpenPaymentModal: () => void;
}

export const CreditView: React.FC<CreditViewProps> = ({
  isPaymentModalOpen,
  onClosePaymentModal,
  onOpenPaymentModal,
}) => {
  const { language, t, isEnglish, isTanglish } = useLanguage();
  const [activeTab, setActiveTab] = useState<'CUSTOMERS' | 'SUPPLIERS' | 'HISTORY'>('CUSTOMERS');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Payment Settlement Form
  const [entityType, setEntityType] = useState<'CUSTOMER' | 'SUPPLIER'>('CUSTOMER');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI'>('CASH');
  const [notes, setNotes] = useState<string>('');

  // Add Credit Form
  const [isAddCreditOpen, setIsAddCreditOpen] = useState<boolean>(false);
  const [addCustomerId, setAddCustomerId] = useState<string>('');
  const [addCreditAmount, setAddCreditAmount] = useState<number>(0);
  const [addCreditNotes, setAddCreditNotes] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [creditSummary, txs] = await Promise.all([
        api.getCreditSummary(),
        api.getCreditTransactions(),
      ]);
      setCustomers(Array.isArray(creditSummary?.customersWithDue) ? creditSummary.customersWithDue : []);
      setSuppliers(Array.isArray(creditSummary?.suppliersWithDue) ? creditSummary.suppliersWithDue : []);
      setTransactions(Array.isArray(txs) ? txs : (txs?.transactions || []));
    } catch (err) {
      console.error('Failed to load credit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntityId || paymentAmount <= 0) return;

    try {
      await api.recordPayment({
        entityType,
        entityId: selectedEntityId,
        amount: paymentAmount,
        paymentMethod,
        notes: notes || 'கடன் வரவு/பற்று தீர்வு',
      });
      setSelectedEntityId('');
      setPaymentAmount(0);
      setNotes('');
      onClosePaymentModal();
      loadData();
    } catch (err: any) {
      alert(err.message || 'பணம் பதிவு செய்ய முடியவில்லை');
    }
  };

  const handleAddCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCustomerId || addCreditAmount <= 0) return;

    try {
      await api.addCredit({
        customerId: addCustomerId,
        amount: addCreditAmount,
        notes: addCreditNotes || 'கடன் சேர்க்கப்பட்டது',
      });
      setAddCustomerId('');
      setAddCreditAmount(0);
      setAddCreditNotes('');
      setIsAddCreditOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'கடன் சேர்க்க முடியவில்லை');
    }
  };

  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const totalReceivables = safeCustomers.reduce((sum, c) => sum + (c.outstandingCredit || 0), 0);
  const totalPayables = safeSuppliers.reduce((sum, s) => sum + (s.outstandingPayable || 0), 0);

  const generateWhatsAppReminder = (customer: Customer) => {
    const text = `வணக்கம் ${customer.name}, உங்கள் கடைக் கணக்கில் நிலுவையில் உள்ள தொகை ₹${customer.outstandingCredit}. வசதியான நேரத்தில் செலுத்துமாறு அன்புடன் கேட்டுக் கொள்கிறோம். நன்றி!`;
    const encoded = encodeURIComponent(text);
    const phone = customer.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/91${phone}?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{isEnglish ? 'Credit & Khata Book' : isTanglish ? 'Credit Ledger (Khata)' : 'கடன் கணக்கு ஏடு (காதா)'}</span>
            <span className="text-emerald-600 font-serif">•</span>
            <span className="text-slate-500 text-sm font-normal">
              {isEnglish ? 'Receivables & Payables' : 'Credit & Khata Ledger'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEnglish
              ? 'Customer credit balances, supplier dues, WhatsApp reminders, and payment settlements'
              : isTanglish
              ? 'Customer receivables and supplier payables'
              : 'வாடிக்கையாளர் வரவு கடன் மற்றும் சப்ளையர் பற்று பாக்கி'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="credit-add-manual-btn"
            onClick={() => setIsAddCreditOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            {isEnglish ? '+ Add Credit' : isTanglish ? '+ Give Credit' : 'கடன் சேர்க்க (+ Credit)'}
          </button>
          <button
            id="credit-record-payment-btn"
            onClick={onOpenPaymentModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            {isEnglish ? 'Settle / Receive Due' : isTanglish ? 'Record Payment' : 'பணம் வரவு/பற்று (Settle Due)'}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              {isEnglish ? 'Customer Receivables' : 'வாடிக்கையாளர் வரவு (Receivables)'}
            </span>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              ₹{totalReceivables.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {customers.length} {isEnglish ? 'customers' : 'வாடிக்கையாளர்கள்'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              {isEnglish ? 'Supplier Payables' : 'சப்ளையர் பற்று (Payables)'}
            </span>
            <p className="text-2xl font-extrabold text-indigo-600 mt-1">
              ₹{totalPayables.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {suppliers.length} {isEnglish ? 'distributors' : 'விநியோகஸ்தர்கள்'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('CUSTOMERS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'CUSTOMERS'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {isEnglish ? 'Customer Receivables' : 'வாடிக்கையாளர் நிலுவைகள்'} ({safeCustomers.length})
        </button>
        <button
          onClick={() => setActiveTab('SUPPLIERS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'SUPPLIERS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {isEnglish ? 'Supplier Payables' : 'சப்ளையர் பாக்கிகள்'} ({safeSuppliers.length})
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'HISTORY'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {isEnglish ? 'Ledger History' : 'பரிவர்த்தனை வரலாறு (Ledger History)'}
        </button>
      </div>

      {/* Content for Customers with Dues */}
      {activeTab === 'CUSTOMERS' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3.5 pl-5">{isEnglish ? 'Customer' : 'வாடிக்கையாளர்'}</th>
                  <th className="p-3.5">{isEnglish ? 'Phone' : 'தொலைபேசி'}</th>
                  <th className="p-3.5 text-right">{isEnglish ? 'Pending Due' : 'நிலுவைத் தொகை (Pending)'}</th>
                  <th className="p-3.5 text-right pr-5">{isEnglish ? 'Action' : 'செயல் (Action)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {safeCustomers.length > 0 ? (
                  safeCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3.5 pl-5 font-bold text-slate-900">{c.name}</td>
                      <td className="p-3.5 text-slate-500">{c.phone || '-'}</td>
                      <td className="p-3.5 text-right font-extrabold text-amber-600 text-sm">
                        ₹{c.outstandingCredit.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-right pr-5">
                        <div className="flex items-center justify-end gap-2">
                          {c.phone && (
                            <button
                              onClick={() => generateWhatsAppReminder(c)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] flex items-center gap-1 border border-emerald-200"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              {isEnglish ? 'WhatsApp Reminder' : 'WhatsApp நினைவூட்டல்'}
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEntityType('CUSTOMER');
                              setSelectedEntityId(c.id);
                              setPaymentAmount(c.outstandingCredit);
                              onOpenPaymentModal();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px]"
                          >
                            {isEnglish ? 'Receive Due' : 'வரவு வை (Receive)'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      {isEnglish ? 'No pending customer credit dues' : 'வாடிக்கையாளர் கடன் நிலுவைகள் எதுவும் இல்லை'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content for Suppliers with Dues */}
      {activeTab === 'SUPPLIERS' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3.5 pl-5">{isEnglish ? 'Supplier' : 'சப்ளையர்'}</th>
                  <th className="p-3.5">{isEnglish ? 'Phone' : 'தொலைபேசி'}</th>
                  <th className="p-3.5 text-right">{isEnglish ? 'Payable Due' : 'செலுத்த வேண்டிய பாக்கி'}</th>
                  <th className="p-3.5 text-right pr-5">{isEnglish ? 'Action' : 'செயல் (Action)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {safeSuppliers.length > 0 ? (
                  safeSuppliers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3.5 pl-5 font-bold text-slate-900">{s.name}</td>
                      <td className="p-3.5 text-slate-500">{s.phone || '-'}</td>
                      <td className="p-3.5 text-right font-extrabold text-indigo-700 text-sm">
                        ₹{s.outstandingPayable.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-right pr-5">
                        <button
                          onClick={() => {
                            setEntityType('SUPPLIER');
                            setSelectedEntityId(s.id);
                            setPaymentAmount(s.outstandingPayable);
                            onOpenPaymentModal();
                          }}
                          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs"
                        >
                          {isEnglish ? 'Pay Supplier' : 'பணம் செலுத்து (Pay Supplier)'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400">
                      {isEnglish ? 'No outstanding supplier payables' : 'சப்ளையர் பாக்கிகள் எதுவும் இல்லை'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content for Ledger History */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
                <tr>
                  <th className="p-3.5 pl-5">{isEnglish ? 'Date' : 'நாள்'}</th>
                  <th className="p-3.5">{isEnglish ? 'Person / Party' : 'நபர் / நிறுவனம்'}</th>
                  <th className="p-3.5">{isEnglish ? 'Type' : 'வகை'}</th>
                  <th className="p-3.5">{isEnglish ? 'Mode' : 'முறை'}</th>
                  <th className="p-3.5 text-right">{isEnglish ? 'Amount' : 'தொகை'}</th>
                  <th className="p-3.5 text-right pr-5">{isEnglish ? 'Balance After' : 'மீதி நிலுவை'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {safeTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-3.5 pl-5 text-slate-500">
                      {new Date(t.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">{t.entityName}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          t.type === 'PAYMENT_RECEIVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.type === 'SUPPLIER_PAYMENT'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.type === 'PAYMENT_RECEIVED'
                          ? isEnglish ? 'Received Payment' : 'வரவு பெறப்பட்டது'
                          : t.type === 'SUPPLIER_PAYMENT'
                          ? isEnglish ? 'Paid to Supplier' : 'சப்ளையருக்கு செலுத்தியது'
                          : isEnglish ? 'Credit Given' : 'கடன் கொடுக்கப்பட்டது'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{t.paymentMethod || 'CASH'}</td>
                    <td className="p-3.5 text-right font-bold text-slate-900">
                      ₹{t.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-right pr-5 font-semibold text-slate-600">
                      ₹{t.balanceAfter.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={onClosePaymentModal}
        title={isEnglish ? 'Settle Due / Record Payment' : 'கடன் வரவு / பற்று தீர்வு (Record Payment)'}
        subtitle={
          isEnglish
            ? 'Record customer payment collection or supplier balance settlement.'
            : 'வாடிக்கையாளரிடம் பெற்ற தொகை அல்லது சப்ளையருக்கு செலுத்திய தொகையை பதிவு செய்யவும்.'
        }
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isEnglish ? 'Settlement Type' : 'தீர்வு வகை'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEntityType('CUSTOMER');
                  setSelectedEntityId('');
                }}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  entityType === 'CUSTOMER'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {isEnglish ? 'Customer Receipt' : 'வாடிக்கையாளர் வரவு'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEntityType('SUPPLIER');
                  setSelectedEntityId('');
                }}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  entityType === 'SUPPLIER'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {isEnglish ? 'Supplier Payment' : 'சப்ளையர் பற்று'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {entityType === 'CUSTOMER'
                ? isEnglish ? 'Select Customer *' : 'வாடிக்கையாளர் தேர்வு *'
                : isEnglish ? 'Select Supplier *' : 'சப்ளையர் தேர்வு *'}
            </label>
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            >
              <option value="">{isEnglish ? '-- Choose Party --' : '-- தேர்ந்தெடுக்கவும் --'}</option>
              {entityType === 'CUSTOMER'
                ? customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({isEnglish ? 'Due' : 'நிலுவை'}: ₹{c.outstandingCredit})
                    </option>
                  ))
                : suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({isEnglish ? 'Due' : 'பாக்கி'}: ₹{s.outstandingPayable})
                    </option>
                  ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isEnglish ? 'Amount (₹) *' : 'தொகை (Amount ₹) *'}
            </label>
            <input
              type="number"
              min="1"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isEnglish ? 'Payment Mode' : 'செலுத்தும் முறை'}
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
            >
              <option value="CASH">{isEnglish ? 'Cash' : 'ரொக்கம் (Cash)'}</option>
              <option value="UPI">Google Pay / PhonePe (UPI)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isEnglish ? 'Notes' : 'குறிப்புகள்'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={isEnglish ? 'Ex: Weekly settlement...' : 'எ.கா: வாராந்திர வரவு...'}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClosePaymentModal}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
            >
              {isEnglish ? 'Cancel' : 'ரத்து'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
            >
              {isEnglish ? 'Confirm Settlement' : 'பதிவு செய் (Confirm)'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Credit Modal */}
      <Modal
        isOpen={isAddCreditOpen}
        onClose={() => setIsAddCreditOpen(false)}
        title={isEnglish ? 'Add Customer Credit (Khata Entry)' : 'வாடிக்கையாளருக்கு கடன் சேர்த்தல் (Add Customer Credit)'}
        subtitle={
          isEnglish
            ? 'Record new credit given directly to customer balance.'
            : 'வாடிக்கையாளர் கணக்கில் புதிய கடன் தொகையை நேரடியாக சேர்க்கவும்.'
        }
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddCredit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isEnglish ? 'Customer *' : 'வாடிக்கையாளர் *'}
            </label>
            <select
              value={addCustomerId}
              onChange={(e) => setAddCustomerId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            >
              <option value="">{isEnglish ? '-- Choose Customer --' : '-- வாடிக்கையாளரைத் தேர்வு செய்யவும் --'}</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone || 'No phone'}) - {isEnglish ? 'Current Due' : 'நடப்பு கடன்'}: ₹{c.outstandingCredit}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isEnglish ? 'Credit Amount (₹) *' : 'கடன் தொகை (₹) *'}
            </label>
            <input
              type="number"
              min="1"
              value={addCreditAmount}
              onChange={(e) => setAddCreditAmount(parseFloat(e.target.value) || 0)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-amber-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isEnglish ? 'Notes' : 'விவரம் (Notes)'}
            </label>
            <input
              type="text"
              value={addCreditNotes}
              onChange={(e) => setAddCreditNotes(e.target.value)}
              placeholder={isEnglish ? 'Ex: Emergency supplies...' : 'எ.கா: அவசர தேவைக்காக வாங்கிய பொருட்கள்...'}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddCreditOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
            >
              {isEnglish ? 'Cancel' : 'ரத்து'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md"
            >
              {isEnglish ? 'Add Credit' : 'கடன் சேர் (Add Credit)'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
