import React, { useState, useEffect } from 'react';
import { Landmark, Search, ExternalLink, CheckCircle2, FileCheck, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { GovernmentScheme } from '../../types';
import { Modal } from '../common/Modal';
import { useLanguage } from '../../context/LanguageContext';

interface SchemesViewProps {
  onAskAIAboutScheme: (schemeName: string) => void;
}

export const SchemesView: React.FC<SchemesViewProps> = ({ onAskAIAboutScheme }) => {
  const { language, t, isEnglish, isTanglish } = useLanguage();
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedScheme, setSelectedScheme] = useState<GovernmentScheme | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getGovernmentSchemes();
      setSchemes(Array.isArray(data) ? data : (data?.schemes || []));
    } catch (err) {
      console.error('Failed to load schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const safeSchemes = Array.isArray(schemes) ? schemes : [];
  const filtered = safeSchemes.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.tamilName && s.tamilName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.agency && s.agency.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>
              {isEnglish
                ? 'Government Schemes & Subsidies'
                : isTanglish
                ? 'Govt MSME Schemes & Subsidies'
                : 'அரசு மானியங்கள் & திட்டங்கள்'}
            </span>
            <span className="text-emerald-600 font-serif">•</span>
            <span className="text-slate-500 text-sm font-normal">
              {isEnglish ? 'MSME Support & Grants' : 'Government MSME Schemes'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEnglish
              ? 'Tamil Nadu & Central Govt subsidies, MUDRA loans, capital subsidies, and application guidance'
              : isTanglish
              ? 'Tamil Nadu and Central govt subsidies, Mudra loans, and application advice'
              : 'தமிழ்நாடு மற்றும் மத்திய அரசு மானியங்கள், முத்ரா கடன்கள் மற்றும் விண்ணப்ப வழிகாட்டல்'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 flex items-center gap-2 shadow-xs">
        <Search className="w-4 h-4 text-slate-400 ml-1" />
        <input
          type="text"
          id="schemes-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            isEnglish
              ? 'Search schemes by name, agency, or subsidy percentage...'
              : 'திட்டத்தின் பெயர் அல்லது மானிய அளவு மூலம் தேடுக...'
          }
          className="flex-1 bg-transparent text-xs focus:outline-none"
        />
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                  {s.agency}
                </span>
                {s.subsidyPercentage && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[10px]">
                    {s.subsidyPercentage}% {isEnglish ? 'Subsidy' : 'மானியம்'}
                  </span>
                )}
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-2">
                {isEnglish ? s.name : s.tamilName || s.name}
              </h3>
              <p className="text-xs font-medium text-slate-500">
                {isEnglish ? s.tamilName : s.name}
              </p>

              <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                {isEnglish
                  ? (s.description || s.descriptionTamil || s.eligibility)
                  : (s.descriptionTamil || s.description || s.eligibilityTamil)}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">
                    {isEnglish ? 'Max Loan / Grant' : 'கடன் வரம்பு'}
                  </span>
                  <span className="font-extrabold text-slate-900">
                    {s.maxLoanAmount || s.maxAmount || (isEnglish ? 'Subject to rules' : 'வரம்புக்கு உட்பட்டது')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">
                    {isEnglish ? 'Interest / Terms' : 'வட்டி மானியம்'}
                  </span>
                  <span className="font-bold text-emerald-700">
                    {s.interestRate || (isEnglish ? 'As per bank norms' : 'வங்கி விதிப்படி')}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => setSelectedScheme(s)}
                className="flex-1 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                {isEnglish ? 'View Details' : 'விவரம் பார்க்க (Details)'}
              </button>
              <button
                onClick={() => onAskAIAboutScheme(s.name)}
                className="py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors border border-emerald-200"
              >
                {isEnglish ? 'Ask AI' : 'AI-யிடம் கேட்க'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Scheme Detail Modal */}
      <Modal
        isOpen={!!selectedScheme}
        onClose={() => setSelectedScheme(null)}
        title={isEnglish ? selectedScheme?.name || '' : selectedScheme?.tamilName || selectedScheme?.name || ''}
        subtitle={`${selectedScheme?.name} (${selectedScheme?.agency})`}
        maxWidth="max-w-xl"
      >
        {selectedScheme && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-700 leading-relaxed text-sm">
              {isEnglish
                ? (selectedScheme.description || selectedScheme.descriptionTamil)
                : (selectedScheme.descriptionTamil || selectedScheme.description || selectedScheme.eligibilityTamil)}
            </p>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 text-[10px] block">
                  {isEnglish ? 'Maximum Loan / Capital:' : 'அதிகபட்ச கடன் / முதலீடு:'}
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedScheme.maxLoanAmount || selectedScheme.maxAmount || (isEnglish ? 'Subject to rules' : 'வரம்புக்கு உட்பட்டது')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">
                  {isEnglish ? 'Government Subsidy:' : 'அரசு மானியம் (Subsidy):'}
                </span>
                <span className="font-bold text-emerald-700 text-sm">
                  {selectedScheme.subsidyPercentage ? `${selectedScheme.subsidyPercentage}%` : (isEnglish ? 'As per scheme rules' : 'விதிப்படி')}
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                {isEnglish ? 'Eligibility Criteria:' : 'தகுதி வரம்புகள் (Eligibility Criteria):'}
              </h4>
              <ul className="space-y-1.5">
                {(Array.isArray(selectedScheme.eligibility)
                  ? selectedScheme.eligibility
                  : [selectedScheme.eligibility || (isEnglish ? 'Registered MSME micro-enterprises in Tamil Nadu' : 'தமிழ்நாடு MSME பதிவு பெற்ற சிறு வணிகர்கள்')]
                ).map((e: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                {isEnglish ? 'Required Documents:' : 'தேவையான ஆவணங்கள் (Required Documents):'}
              </h4>
              <ul className="space-y-1.5">
                {(selectedScheme.documentsRequired ||
                  selectedScheme.requiredDocuments || [
                    isEnglish ? 'Aadhaar Card of Applicant' : 'ஆதார் அட்டை (Aadhaar Card)',
                    isEnglish ? 'Business PAN Card' : 'பான் கார்டு (PAN Card)',
                    isEnglish ? 'Bank Account Passbook / Statement' : 'வங்கி பாஸ்புக் (Bank Passbook)',
                    isEnglish ? 'Business Address / License Proof' : 'வணிக முகவரி சான்று (Business Proof)',
                  ]
                ).map((doc: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-700">
                    <FileCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              {(selectedScheme.applicationUrl || selectedScheme.portalUrl) && (
                <a
                  href={selectedScheme.applicationUrl || selectedScheme.portalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-emerald-700 hover:underline font-semibold"
                >
                  <span>{isEnglish ? 'Official Scheme Portal' : 'அதிகாரப்பூர்வ தளம் (Official Portal)'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <button
                onClick={() => {
                  const name = selectedScheme.name;
                  setSelectedScheme(null);
                  onAskAIAboutScheme(name);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
              >
                {isEnglish ? 'Ask AI about this Scheme' : 'இந்த திட்டம் பற்றி AI-யிடம் கேட்க'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
