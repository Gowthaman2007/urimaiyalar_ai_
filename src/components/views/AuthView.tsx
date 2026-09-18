import React, { useState } from 'react';
import { Bot, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthView: React.FC = () => {
  const { login, loginAsDemo, register } = useAuth();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('demo@urimaiyalar.ai');
  const [password, setPassword] = useState<string>('demo123');
  const [name, setName] = useState<string>('ரவிச்சந்திரன்');
  const [businessName, setBusinessName] = useState<string>('ஸ்ரீ முருகன் மளிகை அங்காடி');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        await register(name, email, password, businessName);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'உள்நுழைவதில் பிழை ஏற்பட்டது');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await loginAsDemo();
    } catch (err: any) {
      setError(err.message || 'Demo கணக்கில் நுழைய முடியவில்லை');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Header */}
        <div className="bg-gradient-to-br from-emerald-800 to-slate-900 p-6 text-white text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-md mb-3">
            உ
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">
            உரிமையாளர் AI
          </h1>
          <p className="text-xs text-emerald-300 font-medium mt-0.5">
            URIMAIYALAR AI • Tamil-First MSME Intelligence
          </p>
          <p className="text-[11px] text-slate-300 mt-2">
            தமிழ்நாடு சிறு வணிகர்களுக்கான முழுமையான வணிக மற்றும் வரவு செலவு தளம்
          </p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div className="p-4 bg-emerald-50 border-b border-emerald-100 text-center">
          <p className="text-xs font-bold text-emerald-900 mb-2">
            🚀 உடனடி நேரடிப் பார்வை (Instant Preview):
          </p>
          <button
            id="auth-demo-login-btn"
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>மாதிரி வணிகக் கணக்கில் நுழைக (1-Click Demo Login)</span>
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="flex items-center justify-center gap-4 mb-4 text-xs">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`pb-1 font-bold transition-all ${
                !isRegister
                  ? 'text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              உள்நுழைக (Sign In)
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`pb-1 font-bold transition-all ${
                isRegister
                  ? 'text-emerald-700 border-b-2 border-emerald-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              புதிய கணக்கு (Sign Up)
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    உங்கள் பெயர் (Owner Name)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    கடையின் பெயர் (Store Name)
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">மின்னஞ்சல் (Email)</label>
              <input
                type="email"
                id="auth-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">கடவுச்சொல் (Password)</label>
              <input
                type="password"
                id="auth-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              id="auth-submit-btn"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs shadow-md transition-all mt-2"
            >
              {loading
                ? 'காத்திருக்கவும்...'
                : isRegister
                ? 'கணக்கு தொடங்கு (Create Account)'
                : 'உள்நுழைக (Sign In)'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% பாதுகாப்பான வணிகத் தரவுத் தளம்</span>
          </div>
        </div>
      </div>
    </div>
  );
};
