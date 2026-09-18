import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle2, Clock, Check } from 'lucide-react';
import { api } from '../../services/api';
import { BusinessAlert } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const AlertsView: React.FC = () => {
  const { language, t, isEnglish, isTanglish } = useLanguage();
  const [alerts, setAlerts] = useState<BusinessAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getAlerts();
      setAlerts(Array.isArray(data) ? data : (data?.alerts || []));
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await api.resolveAlert(id);
      loadData();
    } catch (err) {
      alert(isEnglish ? 'Could not resolve alert' : 'எச்சரிக்கையை முடிக்க முடியவில்லை');
    }
  };

  const safeAlerts = Array.isArray(alerts) ? alerts : [];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{isEnglish ? 'Business Alerts & Warnings' : isTanglish ? 'Business Alerts' : 'வணிக எச்சரிக்கைகள்'}</span>
            <span className="text-emerald-600 font-serif">•</span>
            <span className="text-slate-500 text-sm font-normal">
              {isEnglish ? 'Critical Notifications' : 'Business Alerts'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEnglish
              ? 'Low inventory alerts, overdue customer credit reminders, and urgent business warnings'
              : isTanglish
              ? 'Low stock alerts, overdue credit reminders, and urgent warnings'
              : 'குறைந்த சரக்கு, கடன் தவணை மீறல் மற்றும் அவசர அறிவிப்புகள்'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {safeAlerts.length > 0 ? (
          safeAlerts.map((a) => {
            const isHigh = a.severity === 'HIGH';
            const isMedium = a.severity === 'MEDIUM';

            return (
              <div
                key={a.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  a.isResolved
                    ? 'bg-slate-50/70 border-slate-200/60 opacity-60'
                    : isHigh
                    ? 'bg-rose-50/60 border-rose-200'
                    : isMedium
                    ? 'bg-amber-50/60 border-amber-200'
                    : 'bg-white border-slate-200/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 ${
                      isHigh
                        ? 'bg-rose-100 text-rose-700'
                        : isMedium
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{a.title}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isHigh
                            ? 'bg-rose-100 text-rose-800'
                            : isMedium
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {a.severity}
                      </span>
                      {a.isResolved && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {isEnglish ? 'Resolved' : 'முடிந்தது (Resolved)'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{a.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(a.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {!a.isResolved && (
                  <button
                    onClick={() => handleResolve(a.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shrink-0 flex items-center gap-1.5 shadow-2xs self-end sm:self-center"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isEnglish ? 'Mark as Resolved' : 'சரிசெய்யப்பட்டது'}</span>
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white p-8 text-center text-slate-400 rounded-2xl border border-slate-200/80">
            {isEnglish ? 'No active alerts' : 'எச்சரிக்கைகள் எதுவும் இல்லை'}
          </div>
        )}
      </div>
    </div>
  );
};
