import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Boxes,
  AlertTriangle,
  Receipt,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Clock,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { api } from '../../services/api';
import { DashboardSummary } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface DashboardViewProps {
  onNavigate: (tab: any) => void;
  onOpenNewSale?: () => void;
  onOpenNewPurchase?: () => void;
  onOpenNewExpense?: () => void;
  onOpenCreditModal?: () => void;
  onOpenVoice?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewSale = () => {},
  onOpenNewPurchase = () => {},
  onOpenNewExpense = () => {},
  onOpenCreditModal = () => {},
  onOpenVoice,
}) => {
  const { language, t, isEnglish, isTanglish } = useLanguage();
  const [period, setPeriod] = useState<string>('today');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardData = async (selectedPeriod: string) => {
    setLoading(true);
    try {
      const [sumData, trendData] = await Promise.all([
        api.getDashboardSummary(selectedPeriod),
        api.getTrends(selectedPeriod === '30days' ? 30 : 7),
      ]);
      setSummary(sumData);
      setTrends(trendData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(period);
  }, [period]);

  const periods = [
    { id: 'today', labelTa: 'இன்று (Today)', labelEn: 'Today', labelTanglish: 'Inniku' },
    { id: 'yesterday', labelTa: 'நேற்று (Yesterday)', labelEn: 'Yesterday', labelTanglish: 'Netru' },
    { id: '7days', labelTa: '7 நாட்கள் (7 Days)', labelEn: '7 Days', labelTanglish: '7 Days' },
    { id: '30days', labelTa: '30 நாட்கள் (30 Days)', labelEn: '30 Days', labelTanglish: '30 Days' },
    { id: 'this_month', labelTa: 'இந்த மாதம்', labelEn: 'This Month', labelTanglish: 'This Month' },
    { id: 'last_month', labelTa: 'கடந்த மாதம்', labelEn: 'Last Month', labelTanglish: 'Last Month' },
  ];

  const expenseChartData = summary?.expenseByCategory
    ? Object.entries(summary.expenseByCategory).map(([cat, amount]) => ({
        name: cat,
        amount,
      }))
    : [];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-semibold">
      {/* Top Banner / Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 lg:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{isEnglish ? 'Business Overview' : isTanglish ? 'Business Overview' : 'வணிக மேலோட்டம்'}</span>
            <span className="text-emerald-600 font-serif">•</span>
            <span className="text-slate-500 text-base font-semibold">
              {isEnglish ? 'Live Store Dashboard' : 'Business Overview'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEnglish
              ? 'Real-time Profit & Loss, Cash Flow and Store Intelligence'
              : isTanglish
              ? 'Real-time Profit & Loss and Live Store Intelligence'
              : 'உடனடி லாப நட்ட கணக்கு மற்றும் நேரடி வணிக நிலவரம்'}
          </p>
        </div>

        {/* Period Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/60">
          {periods.map((p) => (
            <button
              key={p.id}
              id={`dashboard-filter-${p.id}`}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === p.id
                  ? 'bg-white text-emerald-700 shadow-xs ring-1 ring-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isEnglish ? p.labelEn : isTanglish ? p.labelTanglish : p.labelTa}
            </button>
          ))}
        </div>
      </div>

      {/* AI Business Intelligence Alert Banner */}
      {summary && summary.tamilInsights && summary.tamilInsights.length > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-4 lg:p-5 rounded-2xl shadow-lg border border-emerald-700/30">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  {isEnglish
                    ? 'Urimaiyalar AI Business Advisor'
                    : isTanglish
                    ? 'Urimaiyalar AI Advisor'
                    : 'உரிமையாளர் AI நுண்ணறிவு வழிகாட்டி (AI Advisor)'}
                </span>
              </div>
              <p className="text-sm font-semibold text-emerald-50 leading-relaxed max-w-3xl">
                {summary.tamilInsights[0]}
              </p>
            </div>

            <button
              id="dashboard-open-assistant-btn"
              onClick={() => onNavigate('assistant')}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0 active:scale-95"
            >
              {isEnglish ? 'Ask AI for Full Advice' : isTanglish ? 'Ask AI Advisor' : 'AI-யிடம் முழு ஆலோசனை கேட்க'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
        {/* Sales */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {isEnglish ? 'Total Sales' : isTanglish ? 'Total Sales' : 'மொத்த விற்பனை'}
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight">
              ₹{(summary?.totalSales || 0).toLocaleString('en-IN')}
            </p>
            <div className="flex items-center gap-1 mt-1 text-[11px]">
              {summary && summary.salesGrowth >= 0 ? (
                <span className="text-emerald-600 font-semibold flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" />+{summary.salesGrowth}%
                </span>
              ) : (
                <span className="text-rose-600 font-semibold flex items-center">
                  <TrendingDown className="w-3 h-3 mr-0.5" />{summary?.salesGrowth}%
                </span>
              )}
              <span className="text-slate-400">{isEnglish ? 'vs prev' : 'vs முன்'}</span>
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {isEnglish ? 'Total Expenses' : isTanglish ? 'Total Selavu' : 'மொத்த செலவு'}
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight">
              ₹{(summary?.totalExpenses || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {isEnglish ? 'Rent, wages, power' : isTanglish ? 'Rent, salary, bills' : 'வாடகை, கூலி, மின்சாரம்'}
            </p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {isEnglish ? 'Net Profit' : isTanglish ? 'Net Profit' : 'நிகர லாபம்'}
            </span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg lg:text-xl font-extrabold text-teal-700 tracking-tight">
              ₹{(summary?.netProfit || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] font-semibold text-teal-600 mt-1">
              {isEnglish ? `Margin: ${summary?.profitMargin || 0}%` : `லாப விகிதம்: ${summary?.profitMargin || 0}%`}
            </p>
          </div>
        </div>

        {/* Customer Receivables */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {isEnglish ? 'Customer Receivables' : isTanglish ? 'Customer Kadan' : 'வாடிக்கையாளர் கடன்'}
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg lg:text-xl font-extrabold text-amber-600 tracking-tight">
              ₹{(summary?.totalReceivables || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {isEnglish ? 'Pending to collect' : isTanglish ? 'Pending Vasool' : 'வசூலிக்க வேண்டியவை'}
            </p>
          </div>
        </div>

        {/* Supplier Payables */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {isEnglish ? 'Supplier Payables' : isTanglish ? 'Supplier Kadan' : 'சப்ளையர் பாக்கி'}
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-lg lg:text-xl font-extrabold text-indigo-600 tracking-tight">
              ₹{(summary?.totalPayables || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {isEnglish ? 'Pending to pay' : isTanglish ? 'Pending Payment' : 'கொடுக்க வேண்டியவை'}
            </p>
          </div>
        </div>

        {/* Inventory Value & Low Stock */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {isEnglish ? 'Inventory Stock' : isTanglish ? 'Stock Value' : 'சரக்கு இருப்பு'}
            </span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div>
            <p className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight">
              ₹{(summary?.totalInventoryValue || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] font-bold text-amber-600 mt-1">
              {summary?.lowStockCount || 0} {isEnglish ? 'items low' : isTanglish ? 'items low' : 'பொருட்கள் குறைவு'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Bar */}
      <div className="flex flex-wrap items-center gap-2.5 p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mr-2">
          {isEnglish ? 'Quick Actions:' : isTanglish ? 'Quick Actions:' : 'உடனடி செயல்கள்:'}
        </span>
        <button
          id="quick-action-new-sale"
          onClick={onOpenNewSale}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          {isEnglish ? 'New Sale' : isTanglish ? 'New Sale' : 'புதிய விற்பனை (New Sale)'}
        </button>
        <button
          id="quick-action-new-purchase"
          onClick={onOpenNewPurchase}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shadow-xs transition-all active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          {isEnglish ? 'New Purchase' : isTanglish ? 'New Purchase' : 'புதிய கொள்முதல் (Purchase)'}
        </button>
        <button
          id="quick-action-new-expense"
          onClick={onOpenNewExpense}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition-all active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          {isEnglish ? 'Record Expense' : isTanglish ? 'Add Expense' : 'செலவு பதிவு (Expense)'}
        </button>
        <button
          id="quick-action-credit-ledger"
          onClick={onOpenCreditModal}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold text-xs transition-all active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          {isEnglish ? 'Credit Khata' : isTanglish ? 'Kadan Khata' : 'கடன் வரவு/பற்று (Ledger)'}
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales & Purchases Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isEnglish
                  ? 'Financial Trends (Sales vs Expense)'
                  : isTanglish
                  ? 'Financial Trends (Sales vs Expense)'
                  : 'விற்பனை மற்றும் கொள்முதல் போக்கு (Financial Trends)'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEnglish ? 'Daily cash flow for the past period' : 'கடந்த 7 நாட்களின் தினசரி பணப் புழக்கம்'}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> {isEnglish ? 'Sales' : 'விற்பனை (Sales)'}
              </span>
              <span className="flex items-center gap-1 text-slate-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> {isEnglish ? 'Expense' : 'செலவு (Expense)'}
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" name="Sales" />
                <Area type="monotone" dataKey="expenses" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses by Category Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isEnglish ? 'Expense Breakdown' : isTanglish ? 'Expense Breakdown' : 'செலவு வகைப்பாடு (Expense Breakdown)'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {isEnglish ? 'Operating expenses for current period' : 'நடப்பு காலத்தின் முக்கிய செலவுகள்'}
            </p>

            <div className="h-52 w-full">
              {expenseChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expenseChartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#475569' }} width={80} axisLine={false} />
                    <Tooltip
                      formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Amount']}
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                      {expenseChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  {isEnglish ? 'No expenses recorded in this period' : 'இக்காலத்தில் செலவுகள் எதுவும் இல்லை'}
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">
              {isEnglish ? 'Total Expenses:' : 'மொத்த செலவு:'}
            </span>
            <span className="font-bold text-slate-800">
              ₹{(summary?.totalExpenses || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Two Columns: Low Stock & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Low Stock Items Urgency List */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">
                {isEnglish
                  ? 'Low Stock Alert Items'
                  : isTanglish
                  ? 'Low Stock Alert Items'
                  : 'கையிருப்பு குறைவான பொருட்கள் (Low Stock Alert)'}
              </h3>
            </div>
            <button
              onClick={() => onNavigate('inventory')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
            >
              {isEnglish ? 'View All' : 'அனைத்தும் பார்'}
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {summary?.lowStockProducts && summary.lowStockProducts.length > 0 ? (
              summary.lowStockProducts.slice(0, 4).map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {isEnglish ? p.name : p.tamilName ? `${p.tamilName} (${p.name})` : p.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      SKU: {p.sku} • {isEnglish ? 'Supplier' : 'சப்ளையர்'}: {p.supplierName || (isEnglish ? 'General' : 'பொது')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200">
                      {isEnglish ? 'Stock:' : 'இருப்பு:'} {p.currentStock} {p.unit}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isEnglish ? 'Min:' : 'தேவை:'} {p.minimumStock} {p.unit}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                {isEnglish ? 'All items are currently in sufficient stock.' : 'அனைத்துப் பொருட்களும் போதுமான கையிருப்பில் உள்ளன.'}
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions Feed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {isEnglish
                  ? 'Recent Transactions'
                  : isTanglish
                  ? 'Recent Transactions'
                  : 'சமீபத்திய பரிவர்த்தனைகள் (Recent Transactions)'}
              </h3>
            </div>
            <button
              onClick={() => onNavigate('sales')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
            >
              {isEnglish ? 'View All' : 'முழு விவரம்'}
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {summary?.recentTransactions && summary.recentTransactions.length > 0 ? (
              summary.recentTransactions.slice(0, 4).map((t) => (
                <div key={t.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                        t.type === 'SALE'
                          ? 'bg-emerald-50 text-emerald-700'
                          : t.type === 'PURCHASE'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {t.type === 'SALE'
                        ? (isEnglish ? 'SALE' : 'விற்பனை')
                        : t.type === 'PURCHASE'
                        ? (isEnglish ? 'PURCHASE' : 'வாங்கியது')
                        : (isEnglish ? 'EXPENSE' : 'செலவு')}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{t.title}</p>
                      <p className="text-[11px] text-slate-500">
                        {t.entity} • {t.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-bold ${
                        t.type === 'SALE' ? 'text-emerald-700' : 'text-slate-800'
                      }`}
                    >
                      {t.type === 'SALE' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {new Date(t.date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                {isEnglish ? 'No recent transactions found' : 'சமீபத்திய பரிவர்த்தனைகள் எதுவும் இல்லை'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
