import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Search, Trash2, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { Expense } from '../../types';
import { Modal } from '../common/Modal';
import { useLanguage } from '../../context/LanguageContext';

interface ExpensesViewProps {
  isModalOpen: boolean;
  onCloseModal: () => void;
  onOpenModal: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  isModalOpen,
  onCloseModal,
  onOpenModal,
}) => {
  const { language, t, isEnglish, isTanglish } = useLanguage();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Form State
  const [category, setCategory] = useState<any>('RENT');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'BANK_TRANSFER'>('CASH');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getExpenses(categoryFilter || undefined);
      setExpenses(Array.isArray(data) ? data : (data?.expenses || []));
    } catch (err) {
      console.error('Failed to load expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) return;

    try {
      await api.createExpense({
        category,
        amount,
        paymentMethod,
        description,
        date,
      });
      setDescription('');
      setAmount(0);
      onCloseModal();
      loadData();
    } catch (err: any) {
      alert(err.message || 'செலவு பதிவு செய்ய முடியவில்லை');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(isEnglish ? 'Are you sure you want to delete this expense record?' : 'இந்த செலவை நீக்க விரும்புகிறீர்களா?')) return;
    try {
      await api.deleteExpense(id);
      loadData();
    } catch (err: any) {
      alert(isEnglish ? 'Could not delete expense' : 'நீக்க முடியவில்லை');
    }
  };

  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const totalExpense = safeExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const categoryLabels: Record<string, string> = {
    RENT: isEnglish ? 'Shop Rent' : 'கடை வாடகை (Rent)',
    ELECTRICITY: isEnglish ? 'Electricity (EB)' : 'மின் கட்டணம் (EB)',
    SALARY: isEnglish ? 'Staff Salary' : 'ஊழியர் சம்பளம் (Salary)',
    TRANSPORT: isEnglish ? 'Transport / Freight' : 'போக்குவரத்து / வண்டி வாடகை',
    MAINTENANCE: isEnglish ? 'Shop Maintenance' : 'பராமரிப்பு (Maintenance)',
    MARKETING: isEnglish ? 'Advertising / Promotion' : 'விளம்பரம் (Marketing)',
    PURCHASE_RELATED: isEnglish ? 'Purchase Sundries' : 'கொள்முதல் துணைச் செலவு',
    OTHER: isEnglish ? 'Other Expenses' : 'இதர செலவுகள் (Other)',
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{isEnglish ? 'Expense Book' : isTanglish ? 'Expense Tracker' : 'செலவுகள் ஏடு'}</span>
            <span className="text-emerald-600 font-serif">•</span>
            <span className="text-slate-500 text-sm font-normal">
              {isEnglish ? 'Operating Expenses' : 'Business Expenses'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEnglish
              ? 'Shop rent, staff salaries, electricity bills, transport, and daily business overheads'
              : isTanglish
              ? 'Shop rent, staff salary, electricity, and other expenses'
              : 'கடை வாடகை, ஊழியர் சம்பளம், மின்சாரம் மற்றும் இதர செலவுகள்'}
          </p>
        </div>

        <button
          onClick={onOpenModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {isEnglish ? 'Add Expense' : isTanglish ? 'Add Expense' : 'செலவு பதிவு செய் (Add Expense)'}
        </button>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase">
            {isEnglish ? 'Total Expenses' : 'மொத்த செலவுத் தொகை'}
          </p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">
            ₹{totalExpense.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
          >
            <option value="">{isEnglish ? '-- All Categories --' : '-- அனைத்து பிரிவுகளும் --'}</option>
            {Object.entries(categoryLabels).map(([cat, label]) => (
              <option key={cat} value={cat}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-3.5 pl-5">{isEnglish ? 'Date' : 'நாள்'}</th>
                <th className="p-3.5">{isEnglish ? 'Category' : 'பிரிவு (Category)'}</th>
                <th className="p-3.5">{isEnglish ? 'Description' : 'விவரம் (Description)'}</th>
                <th className="p-3.5">{isEnglish ? 'Payment Mode' : 'செலுத்தும் முறை'}</th>
                <th className="p-3.5 text-right">{isEnglish ? 'Amount' : 'தொகை (Amount)'}</th>
                <th className="p-3.5 text-right pr-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {safeExpenses.length > 0 ? (
                safeExpenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="p-3.5 pl-5 text-slate-500">
                      {new Date(e.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold text-[10px]">
                        {categoryLabels[e.category] || e.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">{e.description}</td>
                    <td className="p-3.5 text-slate-500">{e.paymentMethod}</td>
                    <td className="p-3.5 text-right font-extrabold text-rose-600 text-sm">
                      ₹{e.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 text-right pr-5">
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    {isEnglish ? 'No expenses recorded' : 'செலவு பதிவுகள் எதுவும் இல்லை'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        title={isEnglish ? 'Record New Expense' : 'செலவு பதிவு செய்தல் (Record Expense)'}
        subtitle={
          isEnglish
            ? 'Specify expense category, amount paid, and payment method.'
            : 'செலவு பிரிவு, தொகை மற்றும் கட்டண முறையைக் குறிப்பிடவும்.'
        }
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isEnglish ? 'Expense Category *' : 'செலவு பிரிவு *'}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
            >
              {Object.entries(categoryLabels).map(([cat, label]) => (
                <option key={cat} value={cat}>
                  {label}
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
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-rose-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isEnglish ? 'Description *' : 'விவரம் (Description) *'}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isEnglish ? 'Ex: Shop rent for October' : 'எ.கா: கடை வாடகை - அக்டோபர் மாதம்'}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEnglish ? 'Payment Mode' : 'செலுத்தும் முறை'}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <option value="CASH">{isEnglish ? 'Cash' : 'ரொக்கம் (Cash)'}</option>
                <option value="UPI">Google Pay / UPI</option>
                <option value="BANK_TRANSFER">{isEnglish ? 'Bank Transfer' : 'வங்கி (Bank)'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isEnglish ? 'Date' : 'நாள் (Date)'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCloseModal}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
            >
              {isEnglish ? 'Cancel' : 'ரத்து'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
            >
              {isEnglish ? 'Save Expense' : 'செலவு சேமி (Save Expense)'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
