import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Phone, FileText, IndianRupee, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Customer } from '../../types';
import { Modal } from '../common/Modal';
import { useLanguage } from '../../context/LanguageContext';

export const CustomersView: React.FC = () => {
  const { language, t, isEnglish, isTanglish } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Add Customer Modal
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Customer Detail Statement Modal
  const [selectedCustDetail, setSelectedCustDetail] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getCustomers();
      setCustomers(Array.isArray(data) ? data : (data?.customers || []));
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      await api.createCustomer({ name, phone, address, notes });
      setName('');
      setPhone('');
      setAddress('');
      setNotes('');
      setIsAddOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'வாடிக்கையாளர் சேர்க்க முடியவில்லை');
    }
  };

  const handleViewStatement = async (id: string) => {
    try {
      const detail = await api.getCustomerDetail(id);
      setSelectedCustDetail(detail);
      setIsDetailOpen(true);
    } catch (err: any) {
      alert('கணக்கு விவரங்களை ஏற்ற முடியவில்லை');
    }
  };

  const safeCustomers = Array.isArray(customers) ? customers : [];
  const filtered = safeCustomers.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm))
  );

  const totalOutstanding = safeCustomers.reduce((sum, c) => sum + (c.outstandingCredit || 0), 0);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{isEnglish ? 'Customer Ledger' : isTanglish ? 'Customer Directory' : 'வாடிக்கையாளர் ஏடு'}</span>
            <span className="text-emerald-600 font-serif">•</span>
            <span className="text-slate-500 text-sm font-normal">
              {isEnglish ? 'Accounts & Khata' : 'Customer Directory'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEnglish
              ? 'Customer profiles, credit balances, khata statements, and order history'
              : isTanglish
              ? 'Customers, credit balance, and purchase history'
              : 'வாடிக்கையாளர்கள், கடன் கணக்கு விவரங்கள் மற்றும் கொள்முதல் வரலாறு'}
          </p>
        </div>

        <button
          id="customers-add-btn"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {isEnglish ? 'Add Customer' : isTanglish ? 'Add Customer' : 'புதிய வாடிக்கையாளர் (Add Customer)'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase">
            {isEnglish ? 'Total Customers' : 'மொத்த வாடிக்கையாளர்கள்'}
          </p>
          <p className="text-xl font-extrabold text-slate-900">
            {customers.length} {isEnglish ? 'people' : 'நபர்கள்'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold text-amber-700 uppercase">
            {isEnglish ? 'Total Outstanding Receivables' : 'வசூலிக்க வேண்டிய மொத்த கடன்'}
          </p>
          <p className="text-xl font-extrabold text-amber-600">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold text-emerald-700 uppercase">
            {isEnglish ? 'Customers with Active Credit' : 'கடன் வைத்துள்ள நபர்கள்'}
          </p>
          <p className="text-xl font-extrabold text-emerald-800">
            {safeCustomers.filter((c) => c.outstandingCredit > 0).length} {isEnglish ? 'people' : 'நபர்கள்'}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 flex items-center gap-2 shadow-xs">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input
          type="text"
          id="customers-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            isEnglish
              ? 'Search customer name or phone number...'
              : isTanglish
              ? 'Search customer name or phone number...'
              : 'வாடிக்கையாளர் பெயர் அல்லது தொலைபேசி எண் தேடுக...'
          }
          className="flex-1 bg-transparent text-xs focus:outline-none"
        />
      </div>

      {/* Customers List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                  {c.phone && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {c.phone}
                    </p>
                  )}
                </div>
                {c.outstandingCredit > 0 ? (
                  <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs border border-amber-200">
                    {isEnglish ? 'Due' : 'நிலுவை'}: ₹{c.outstandingCredit.toLocaleString('en-IN')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs">
                    {isEnglish ? 'No Due' : 'கடன் இல்லை'}
                  </span>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">
                    {isEnglish ? 'Total Purchases' : 'மொத்த கொள்முதல்'}
                  </span>
                  <span className="font-bold text-slate-800">
                    ₹{c.totalPurchases.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">
                    {isEnglish ? 'Total Paid' : 'செலுத்திய தொகை'}
                  </span>
                  <span className="font-bold text-emerald-700">
                    ₹{c.totalPaid.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2">
              <button
                onClick={() => handleViewStatement(c.id)}
                className="w-full flex items-center justify-center gap-1 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-semibold transition-colors border border-slate-200/60"
              >
                <span>{isEnglish ? 'View Khata / Ledger' : 'கணக்கு ஏடு பார்க்க (View Ledger)'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={isEnglish ? 'Add New Customer' : 'புதிய வாடிக்கையாளர் சேர்க்க (Add Customer)'}
        subtitle={
          isEnglish
            ? 'Record customer name and phone contact.'
            : 'பெயர் மற்றும் தொடர்பு எண்ணைப் பதிவு செய்யவும்.'
        }
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddCustomer} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isEnglish ? 'Customer Name *' : 'வாடிக்கையாளர் பெயர் *'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isEnglish ? 'Ex: Ravi Kumar' : 'எ.கா: ரவி குமார்'}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isEnglish ? 'Phone Number' : 'தொலைபேசி எண்'}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isEnglish ? 'Address' : 'முகவரி (Address)'}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={isEnglish ? 'Street, Area...' : 'தெரு, ஊர்...'}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
            >
              {isEnglish ? 'Cancel' : 'ரத்து'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
            >
              {isEnglish ? 'Save Customer' : 'சேமி (Save)'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer Ledger Statement Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={
          isEnglish
            ? `Statement: ${selectedCustDetail?.customer?.name || ''}`
            : `கணக்கு அறிக்கை: ${selectedCustDetail?.customer?.name || ''}`
        }
        subtitle={
          isEnglish
            ? `Current Outstanding Balance: ₹${selectedCustDetail?.customer?.outstandingCredit || 0}`
            : `நடப்பு நிலுவைத் தொகை: ₹${selectedCustDetail?.customer?.outstandingCredit || 0}`
        }
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between">
            <div>
              <p className="font-bold text-slate-800">
                {isEnglish ? 'Phone' : 'தொலைபேசி'}: {selectedCustDetail?.customer?.phone || (isEnglish ? 'None' : 'இல்லை')}
              </p>
              <p className="text-slate-500">
                {isEnglish ? 'Address' : 'முகவரி'}: {selectedCustDetail?.customer?.address || '-'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-500">
                {isEnglish ? 'Total Purchases' : 'மொத்த கொள்முதல்'}: ₹{selectedCustDetail?.customer?.totalPurchases || 0}
              </p>
              <p className="font-extrabold text-amber-700 text-sm">
                {isEnglish ? 'Balance Due' : 'நிலுவை'}: ₹{selectedCustDetail?.customer?.outstandingCredit || 0}
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">
              {isEnglish ? 'Ledger Timeline & Transactions' : 'கடன் மற்றும் வரவு பரிவர்த்தனைகள் (Ledger Timeline)'}
            </h4>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold">
                  <tr>
                    <th className="p-2.5">{isEnglish ? 'Date' : 'நாள்'}</th>
                    <th className="p-2.5">{isEnglish ? 'Type' : 'வகை'}</th>
                    <th className="p-2.5 text-right">{isEnglish ? 'Amount' : 'தொகை'}</th>
                    <th className="p-2.5 text-right">{isEnglish ? 'Balance After' : 'மீதி இருப்பு'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedCustDetail?.creditTransactions && selectedCustDetail.creditTransactions.length > 0 ? (
                    selectedCustDetail.creditTransactions.map((tx: any) => (
                      <tr key={tx.id}>
                        <td className="p-2.5 text-slate-500">
                          {new Date(tx.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-2.5 font-semibold">
                          {tx.type === 'CREDIT_GIVEN' ? (
                            <span className="text-amber-700">
                              {isEnglish ? 'Credit Given' : 'கடன் கொடுக்கப்பட்டது'}
                            </span>
                          ) : (
                            <span className="text-emerald-700">
                              {isEnglish ? 'Payment Received' : 'பணம் வரவு வைக்கப்பட்டது'}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-right font-bold">₹{tx.amount}</td>
                        <td className="p-2.5 text-right font-extrabold text-slate-900">₹{tx.balanceAfter}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400">
                        {isEnglish ? 'No ledger transactions recorded' : 'பரிவர்த்தனை பதிவுகள் எதுவும் இல்லை'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
