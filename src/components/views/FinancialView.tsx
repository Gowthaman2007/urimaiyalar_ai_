import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, ShieldCheck, Sparkles, IndianRupee, PieChart } from 'lucide-react';
import { api } from '../../services/api';
import { FinancialSummary } from '../../types';

export const FinancialView: React.FC = () => {
  const [financials, setFinancials] = useState<FinancialSummary | null>(null);
  const [period, setPeriod] = useState<string>('month');
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getFinancialSummary(period);
      setFinancials(data);
    } catch (err) {
      console.error('Failed to load financial summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [period]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>நிதி பகுப்பாய்வு & லாப அறிக்கை</span>
            <span className="text-emerald-600 font-serif">•</span>
            <span className="text-slate-500 text-sm font-normal">P&L Financial Intelligence</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            வணிக நிகர லாபம், செலவுகள் மற்றும் AI நிதி ஆரோக்கியக் குறியீடு
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === 'month' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            நடப்பு மாதம் (This Month)
          </button>
          <button
            onClick={() => setPeriod('quarter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === 'quarter' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            காலாண்டு (Quarter)
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === 'year' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            நடப்பு ஆண்டு (Year)
          </button>
        </div>
      </div>

      {financials ? (
        <>
          {/* Main Profit & Margins Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                மொத்த வருவாய் (Total Revenue)
              </span>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                ₹{financials.totalRevenue.toLocaleString('en-IN')}
              </p>
              <span className="text-xs text-emerald-600 font-bold mt-1 inline-block">
                விற்பனை மூலம்
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                பொருட்கள் அடக்கம் (COGS)
              </span>
              <p className="text-2xl font-extrabold text-slate-700 mt-1">
                ₹{financials.costOfGoodsSold.toLocaleString('en-IN')}
              </p>
              <span className="text-xs text-slate-400 font-medium mt-1 inline-block">
                கொள்முதல் செலவு
              </span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                மொத்த லாபம் (Gross Profit)
              </span>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                ₹{financials.grossProfit.toLocaleString('en-IN')}
              </p>
              <span className="text-xs font-bold text-emerald-700 mt-1 inline-block">
                லாப வரம்பு: {financials.grossProfitMargin}%
              </span>
            </div>

            <div className="bg-emerald-900 text-white p-4 rounded-2xl shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                நிகர லாபம் (Net Profit)
              </span>
              <p className="text-2xl font-black text-white mt-1">
                ₹{financials.netProfit.toLocaleString('en-IN')}
              </p>
              <span className="text-xs font-bold text-emerald-300 mt-1 inline-block">
                நிகர வரம்பு: {financials.netProfitMargin}%
              </span>
            </div>
          </div>

          {/* Detailed P&L Breakdown Table & Expense categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* P&L Table */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>வருவாய் & லாப இழப்பு விவரம் (P&L Breakdown)</span>
              </h2>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="font-semibold text-slate-900">(+) மொத்த விற்பனை வருவாய் (Sales)</span>
                  <span className="font-bold text-slate-900">
                    ₹{financials.totalRevenue.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                  <span>(-) விற்ற பொருட்களின் அடக்க விலை (COGS)</span>
                  <span className="font-medium text-rose-600">
                    -₹{financials.costOfGoodsSold.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between py-2 bg-emerald-50/70 px-3 rounded-xl font-bold text-emerald-950">
                  <span>(=) மொத்த லாபம் (Gross Profit)</span>
                  <span>₹{financials.grossProfit.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                  <span>(-) செயல்பாட்டு & கடை செலவுகள் (Expenses)</span>
                  <span className="font-medium text-rose-600">
                    -₹{financials.operatingExpenses.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between py-2.5 bg-slate-900 text-white px-3 rounded-xl font-extrabold text-sm">
                  <span>(=) நிகர வணிக லாபம் (Net Profit)</span>
                  <span className="text-emerald-400">
                    ₹{financials.netProfit.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Financial Health & Recommendations */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>AI நிதி ஆரோக்கியம் & ஆலோசனைகள்</span>
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                  நிலை: {financials.healthScore}
                </span>
              </div>

              <div className="space-y-3">
                {financials.aiInsights.map((insight: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs leading-relaxed text-slate-700 flex items-start gap-2.5"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <div>
                  <span className="font-bold block">கடன் வசூல் முக்கியத்துவம்:</span>
                  <span className="text-[11px] text-amber-800">
                    நிலுவைக் கடன்களை விரைவாக வசூலித்தால் ரொக்கப் புழக்கம் 18% உயரும்.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-slate-400">நிதித் தரவுகளை ஏற்றுகிறது...</div>
      )}
    </div>
  );
};
