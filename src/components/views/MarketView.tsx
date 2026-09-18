import React, { useState, useEffect } from 'react';
import { Store, TrendingUp, TrendingDown, Minus, RefreshCw, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { MarketPrice } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const MarketView: React.FC = () => {
  const { language, t, isEnglish, isTanglish } = useLanguage();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [marketFilter, setMarketFilter] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getMarketPrices(marketFilter || undefined);
      setPrices(Array.isArray(data) ? data : (data?.prices || []));
    } catch (err) {
      console.error('Failed to load market prices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [marketFilter]);

  const safePrices = Array.isArray(prices) ? prices : [];
  const uniqueMarkets = Array.from(new Set(safePrices.map((p) => p.market)));

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>
              {isEnglish
                ? 'Daily Mandi & Wholesale Market Prices'
                : isTanglish
                ? 'Daily Mandi Market Prices'
                : 'தினசரி சந்தை நிலவரம் & மாண்டி விலைகள்'}
            </span>
            <span className="text-emerald-600 font-serif">•</span>
            <span className="text-slate-500 text-sm font-normal">
              {isEnglish ? 'TN Wholesale Mandis' : 'Mandi Market Prices'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEnglish
              ? 'Real-time wholesale prices from Koyambedu, Madurai, Erode, and major agricultural markets'
              : isTanglish
              ? 'Daily wholesale prices from Koyambedu, Madurai, and other major markets'
              : 'கோயம்பேடு, மதுரை, ஈரோடு உள்ளிட்ட முக்கிய சந்தைகளின் அன்றாட மொத்த விலை நிலவரம்'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
          >
            <option value="">{isEnglish ? '-- All Mandi Markets --' : '-- அனைத்து சந்தைகளும் --'}</option>
            {uniqueMarkets.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
            title={isEnglish ? 'Refresh' : 'புதுப்பி'}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Mandi Prices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {safePrices.map((p) => {
          const isUp = p.trend === 'UP';
          const isDown = p.trend === 'DOWN';

          return (
            <div
              key={p.id}
              className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {isEnglish ? p.commodity : p.tamilName || p.commodity}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isEnglish ? (p.tamilName || p.commodity) : p.commodity} • {p.variety || 'Standard'}
                    </p>
                  </div>
                  <span
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      isUp
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : isDown
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isUp && <TrendingUp className="w-3 h-3 text-rose-600" />}
                    {isDown && <TrendingDown className="w-3 h-3 text-emerald-600" />}
                    {!isUp && !isDown && <Minus className="w-3 h-3 text-slate-400" />}
                    {isUp
                      ? (isEnglish ? 'Trending Up' : 'விலை ஏறுமுகம்')
                      : isDown
                      ? (isEnglish ? 'Trending Down' : 'விலை இறங்குமுகம்')
                      : (isEnglish ? 'Stable Price' : 'நிலையான விலை')}
                  </span>
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      {isEnglish ? 'Modal (Average) Price' : 'சராசரி மாண்டி விலை (Modal)'}
                    </span>
                    <span className="text-xl font-extrabold text-slate-900">
                      ₹{p.modalPrice}
                    </span>
                    <span className="text-xs text-slate-500 font-medium"> / {p.unit}</span>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-slate-500">{isEnglish ? 'Min: ₹' : 'குறைந்தது: ₹'}{p.minPrice}</p>
                    <p className="text-slate-500">{isEnglish ? 'Max: ₹' : 'அதிகபட்சம்: ₹'}{p.maxPrice}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-emerald-800">{p.market}</span>
                <span>{new Date(p.date).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
