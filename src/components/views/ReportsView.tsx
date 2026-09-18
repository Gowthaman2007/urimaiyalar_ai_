import React, { useState } from 'react';
import { FileSpreadsheet, Download, CheckCircle, Calendar, ArrowDown } from 'lucide-react';
import { api } from '../../services/api';

export const ReportsView: React.FC = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadReport = async (type: string, name: string) => {
    setDownloading(type);
    try {
      const data = await api.getReportData(type);
      // Convert data to CSV
      if (!data || data.length === 0) {
        alert('இந்த அறிக்கையில் பதிவுகள் இல்லை');
        return;
      }
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map((obj: any) =>
        Object.values(obj)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      );
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${name}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('அறிக்கையை பதிவிறக்க முடியவில்லை');
    } finally {
      setDownloading(null);
    }
  };

  const reportCards = [
    {
      type: 'sales',
      title: 'விற்பனை அறிக்கை (Sales Report)',
      desc: 'அனைத்து விற்பனை பில்கள், வாடிக்கையாளர்கள், வரி மற்றும் லாப விவரங்கள்.',
      color: 'border-emerald-200 bg-emerald-50/40',
    },
    {
      type: 'inventory',
      title: 'சரக்கு இருப்பு அறிக்கை (Inventory Stock)',
      desc: 'பொருட்களின் தற்போதைய இருப்பு, அடக்க விலை மற்றும் மொத்த சரக்கு மதிப்பீடு.',
      color: 'border-sky-200 bg-sky-50/40',
    },
    {
      type: 'credit',
      title: 'கடன் ஏடு அறிக்கை (Credit & Khata Statement)',
      desc: 'வாடிக்கையாளர் வாரியாக வசூலிக்க வேண்டிய கடன் நிலுவைத் தொகைகள்.',
      color: 'border-amber-200 bg-amber-50/40',
    },
    {
      type: 'expenses',
      title: 'செலவு அறிக்கை (Expenses Statement)',
      desc: 'வாடகை, சம்பளம், மின் கட்டணம் உள்ளிட்ட வகைப்படுத்தப்பட்ட கடை செலவுகள்.',
      color: 'border-rose-200 bg-rose-50/40',
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>வணிக அறிக்கைகள் & தரவிறக்கம்</span>
            <span className="text-emerald-600 font-serif">•</span>
            <span className="text-slate-500 text-sm font-normal">Business Reports</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Excel / CSV கோப்புகளாக கணக்கு அறிக்கைகளை எளிதாக ஏற்றுமதி செய்யலாம்
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportCards.map((rc) => (
          <div
            key={rc.type}
            className={`p-5 rounded-2xl border ${rc.color} flex flex-col justify-between shadow-xs`}
          >
            <div>
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>{rc.title}</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{rc.desc}</p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">வடிவம்: Excel CSV (.csv)</span>
              <button
                onClick={() => handleDownloadReport(rc.type, rc.type)}
                disabled={downloading === rc.type}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs shadow-xs transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading === rc.type ? 'தயாராகிறது...' : 'CSV பதிவிறக்கு'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
