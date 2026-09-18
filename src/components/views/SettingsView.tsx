import React, { useState, useEffect } from 'react';
import { Settings, Store, Sparkles, Database, RotateCcw, Check, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';

export const SettingsView: React.FC = () => {
  const { business, user, updateBusiness } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [businessName, setBusinessName] = useState<string>(business?.businessName || business?.name || '');
  const [ownerName, setOwnerName] = useState<string>(business?.ownerName || '');
  const [phone, setPhone] = useState<string>(business?.phone || '');
  const [city, setCity] = useState<string>(business?.district || business?.city || '');
  const [address, setAddress] = useState<string>(business?.address || '');
  const [gstin, setGstin] = useState<string>(business?.gstin || '');
  const [category, setCategory] = useState<string>(business?.category || 'RETAIL_GROCERY');

  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);

  useEffect(() => {
    if (business) {
      setBusinessName(business.businessName || business.name || '');
      setOwnerName(business.ownerName || '');
      setPhone(business.phone || '');
      setCity(business.district || business.city || '');
      setAddress(business.address || '');
      setGstin(business.gstin || '');
      setCategory(business.category);
    }
  }, [business]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await updateBusiness({
        name: businessName,
        ownerName,
        phone,
        city,
        address,
        gstin,
        category,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'சுயவிவரத்தைச் சேமிக்க முடியவில்லை');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemoData = async () => {
    if (
      !window.confirm(
        'மாதிரி வணிகத் தரவுகளை (Demo Data) மீண்டும் புதுப்பிக்க விரும்புகிறீர்களா? முந்தைய மாற்றங்கள் மீட்டமைக்கப்படும்.'
      )
    ) {
      return;
    }

    setResetting(true);
    try {
      await api.resetDemoData();
      alert('மாதிரி வணிகத் தரவுகள் வெற்றிகரமாக மீட்டமைக்கப்பட்டன!');
      window.location.reload();
    } catch (err: any) {
      alert('மீட்டமைக்க முடியவில்லை: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>அமைப்புகள் & சுயவிவரம்</span>
          <span className="text-emerald-600 font-serif">•</span>
          <span className="text-slate-500 text-sm font-normal">Settings & Profile</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          உங்கள் கடையின் பெயர், முகவரி, மொழி மற்றும் AI உள்ளமைவுகள்
        </p>
      </div>

      {/* Business Info Form */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Store className="w-4 h-4 text-emerald-600" />
          <span>வணிக சுயவிவரம் (Business Information)</span>
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                கடையின் பெயர் (Business / Store Name) *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                உரிமையாளர் பெயர் (Owner Name) *
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                தொடர்பு எண் (Phone)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                நகரம் / மாவட்டம் (City / District)
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                வணிகப் பிரிவு (Category)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium"
              >
                <option value="RETAIL_GROCERY">மளிகை & பல்பொருள் அங்காடி (Retail Grocery)</option>
                <option value="PRODUCE_VEGETABLES">காய்கறி & பழக் கடை (Produce)</option>
                <option value="TEXTILES_CLOTHING">துணிக்கடை & ரெடிமேட்ஸ் (Textiles)</option>
                <option value="HARDWARE_ELECTRICAL">ஹார்டுவேர் & எலக்ட்ரிக்கல்</option>
                <option value="PHARMACY_MEDICAL">மருந்தகம் (Pharmacy)</option>
                <option value="SWEETS_BAKERY">பேக்கரி & இனிப்பகம் (Bakery)</option>
                <option value="OTHER">பிற சிறுவணிகம் (Other)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              முழு முகவரி (Store Address)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" />
                சுயவிவரம் வெற்றிகரமாகச் சேமிக்கப்பட்டது!
              </span>
            ) : (
              <div />
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              {saving ? 'சேமிக்கிறது...' : 'விவரங்களைச் சேமி (Save Settings)'}
            </button>
          </div>
        </form>
      </div>

      {/* AI & Language Engine Settings */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>உரிமையாளர் AI & மொழி அமைப்புகள் (AI & Language)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">இயல்பு மொழி (Default Language):</span>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setLanguage('ta')}
                className={`px-3 py-1.5 rounded-lg font-bold ${
                  language === 'ta'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                தமிழ் (Tamil)
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg font-bold ${
                  language === 'en'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-800 block mb-1">AI என்ஜின் நிலை:</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-emerald-800 text-xs">
                Gemini 3.8 Flash + Tamil NLU
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Grounded to Live Business Database with deterministic fallback
            </p>
          </div>
        </div>
      </div>

      {/* Demo Data Management */}
      <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-rose-600" />
          <span>மாதிரி வணிகத் தரவுகள் (Demo Data Reset)</span>
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          பயிற்சிக்கான மாதிரி விற்பனை பில்கள், மளிகைப் பொருட்கள், வாடிக்கையாளர்கள் மற்றும் கடன் பதிவுகளை
          மீண்டும் ஆரம்ப நிலைக்கு மாற்ற விரும்பினால் இந்த பொத்தானைப் பயன்படுத்தவும்.
        </p>

        <button
          id="settings-reset-demo-btn"
          type="button"
          onClick={handleResetDemoData}
          disabled={resetting}
          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{resetting ? 'மீட்டமைக்கிறது...' : 'மாதிரி தரவுகளை மீட்டமை (Reset Demo Store)'}</span>
        </button>
      </div>
    </div>
  );
};
