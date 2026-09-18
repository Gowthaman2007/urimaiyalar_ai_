import React, { useState, useEffect } from 'react';
import { Truck, Plus, Search, Phone, IndianRupee } from 'lucide-react';
import { api } from '../../services/api';
import { Supplier } from '../../types';
import { Modal } from '../common/Modal';
import { useLanguage } from '../../context/LanguageContext';

export const SuppliersView: React.FC = () => {
  const { language, t, isEnglish, isTanglish } = useLanguage();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Add Supplier Modal
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getSuppliers();
      setSuppliers(Array.isArray(data) ? data : (data?.suppliers || []));
    } catch (err) {
      console.error('Failed to load suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      await api.createSupplier({ name, phone, address, notes });
      setName('');
      setPhone('');
      setAddress('');
      setNotes('');
      setIsAddOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'சப்ளையர் சேர்க்க முடியவில்லை');
    }
  };

  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];
  const filtered = safeSuppliers.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.phone && s.phone.includes(searchTerm))
  );

  const totalPayables = safeSuppliers.reduce((sum, s) => sum + (s.outstandingPayable || 0), 0);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{isEnglish ? 'Supplier Directory' : isTanglish ? 'Supplier Directory' : 'சப்ளையர் ஏடு'}</span>
            <span className="text-emerald-600 font-serif">•</span>
            <span className="text-slate-500 text-sm font-normal">
              {isEnglish ? 'Wholesalers & Distributors' : 'Supplier Directory'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEnglish
              ? 'Wholesalers, vendor contacts, and outstanding payable accounts'
              : isTanglish
              ? 'Wholesalers, contact numbers, and payable details'
              : 'மொத்த வியாபாரிகள், தொடர்பு எண்கள் மற்றும் பாக்கி விவரங்கள்'}
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {isEnglish ? 'Add Supplier' : isTanglish ? 'Add Supplier' : 'புதிய சப்ளையர் (Add Supplier)'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase">
            {isEnglish ? 'Total Suppliers' : 'மொத்த சப்ளையர்கள்'}
          </p>
          <p className="text-xl font-extrabold text-slate-900">
            {suppliers.length} {isEnglish ? 'distributors' : 'விநியோகஸ்தர்கள்'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold text-indigo-600 uppercase">
            {isEnglish ? 'Total Outstanding Payables' : 'செலுத்த வேண்டிய மொத்த பாக்கி'}
          </p>
          <p className="text-xl font-extrabold text-indigo-700">
            ₹{totalPayables.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{s.name}</h3>
                  {s.phone && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {s.phone}
                    </p>
                  )}
                </div>
                {s.outstandingPayable > 0 ? (
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 font-bold text-xs border border-indigo-200">
                    {isEnglish ? 'Due' : 'பாக்கி'}: ₹{s.outstandingPayable.toLocaleString('en-IN')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs">
                    {isEnglish ? 'No Due' : 'பாக்கி இல்லை'}
                  </span>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">
                    {isEnglish ? 'Total Purchases' : 'மொத்த கொள்முதல்'}
                  </span>
                  <span className="font-bold text-slate-800">
                    ₹{s.totalPurchases.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">
                    {isEnglish ? 'Total Paid' : 'செலுத்திய தொகை'}
                  </span>
                  <span className="font-bold text-emerald-700">
                    ₹{s.totalPaid.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Supplier Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={isEnglish ? 'Add New Supplier' : 'புதிய சப்ளையர் சேர்க்க (Add Supplier)'}
        subtitle={
          isEnglish
            ? 'Distributor name and billing address details.'
            : 'விநியோகஸ்தர் பெயர் மற்றும் தொடர்பு முகவரி.'
        }
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddSupplier} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isEnglish ? 'Supplier / Wholesaler Name *' : 'சப்ளையர் பெயர் *'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isEnglish ? 'Ex: Sri Murugan Traders' : 'எ.கா: ஸ்ரீ முருகன் டிரேடர்ஸ்'}
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
              {isEnglish ? 'Address' : 'முகவரி'}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={isEnglish ? 'Wholesale market, city...' : 'மொத்த விற்பனை சந்தை, ஊர்...'}
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
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md"
            >
              {isEnglish ? 'Save Supplier' : 'சேமி (Save Supplier)'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
