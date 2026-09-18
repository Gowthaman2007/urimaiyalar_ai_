import React, { useState, useEffect } from 'react';
import { Brain, Plus, Search, Pin, Calendar, Tag, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { BusinessMemoryItem } from '../../types';
import { Modal } from '../common/Modal';
import { useLanguage } from '../../context/LanguageContext';

export const MemoryView: React.FC = () => {
  const { language, t, isEnglish, isTanglish } = useLanguage();
  const [memories, setMemories] = useState<BusinessMemoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Add Memory Modal
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [category, setCategory] = useState<any>('GENERAL_NOTE');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [tamilContent, setTamilContent] = useState<string>('');
  const [importance, setImportance] = useState<number>(3);
  const [tags, setTags] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getMemories(categoryFilter || undefined);
      setMemories(Array.isArray(data) ? data : (data?.memories || []));
    } catch (err) {
      console.error('Failed to load memory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [categoryFilter]);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      await api.createMemory({
        category,
        title,
        content,
        tamilContent: tamilContent || content,
        importance,
        tags: tags ? tags.split(',').map((t) => t.trim()) : [],
      });
      setTitle('');
      setContent('');
      setTamilContent('');
      setTags('');
      setIsAddOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'நினைவகத்தில் சேர்க்க முடியவில்லை');
    }
  };

  const safeMemories = Array.isArray(memories) ? memories : [];
  const filtered = safeMemories.filter((m) => {
    const q = searchTerm.toLowerCase();
    return (
      m.title?.toLowerCase().includes(q) ||
      m.content?.toLowerCase().includes(q) ||
      (m.tamilContent && m.tamilContent.toLowerCase().includes(q))
    );
  });

  const categoryLabels: Record<string, string> = {
    SUPPLIER_TERMS: isEnglish ? 'Supplier Terms' : 'சப்ளையர் ஒப்பந்தம் (Supplier Terms)',
    CUSTOMER_PREFERENCE: isEnglish ? 'Customer Preference' : 'வாடிக்கையாளர் விருப்பம் (Customer Pref)',
    PRICING_RULE: isEnglish ? 'Pricing Rule' : 'விலை விதிமுறை (Pricing Rule)',
    SEASONAL_PATTERN: isEnglish ? 'Seasonal Trend / Festival' : 'பண்டிகை & பருவக்கால விவரம் (Seasonal)',
    LOCAL_CONDITION: isEnglish ? 'Local Market Condition' : 'உள்ளூர் சந்தை நிலைமை (Local Market)',
    GENERAL_NOTE: isEnglish ? 'General Note' : 'பொதுவான வணிகக் குறிப்பு (General Note)',
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{isEnglish ? 'Business Memory & Knowledge' : isTanglish ? 'Business Memory' : 'வணிக நினைவகம்'}</span>
            <span className="text-emerald-600 font-serif">•</span>
            <span className="text-slate-500 text-sm font-normal">
              {isEnglish ? 'Knowledge Base' : 'Business Memory'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEnglish
              ? 'Supplier credit terms, festival patterns, and long-term memory for business insights'
              : isTanglish
              ? 'Shop credit terms, festival trends, and AI knowledge base'
              : 'கடைக்கடன் நெறிமுறைகள், பண்டிகை அனுபவங்கள் மற்றும் AI-ன் நீண்டகால அறிவுத் தளம்'}
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {isEnglish ? 'Add Memory' : isTanglish ? 'Add Memory' : 'புதிய குறிப்பு சேர் (Add Memory)'}
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex-1 flex items-center gap-2 w-full">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            id="memory-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isEnglish ? 'Search business memory and rules...' : 'நினைவகக் குறிப்புகளைத் தேடுக...'}
            className="flex-1 bg-transparent text-xs focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold"
        >
          <option value="">{isEnglish ? '-- All Categories --' : '-- அனைத்து வகைகளும் --'}</option>
          {Object.entries(categoryLabels).map(([cat, label]) => (
            <option key={cat} value={cat}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Memory Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                  {(m.category && categoryLabels[m.category]) || m.category || (isEnglish ? 'General' : 'பொது நினைவகம்')}
                </span>
                {m.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500" />}
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-2">{m.title}</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed whitespace-pre-wrap">
                {isEnglish ? (m.content || m.tamilContent) : (m.tamilContent || m.content)}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(m.createdAt).toLocaleDateString('en-IN')}
              </span>
              <div className="flex gap-1">
                {(m.tags || []).slice(0, 2).map((t: string, idx: number) => (
                  <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Memory Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={isEnglish ? 'Add Business Memory' : 'புதிய வணிக நினைவகம் சேர்த்தல் (Add Business Memory)'}
        subtitle={
          isEnglish
            ? 'The assistant remembers these business rules to advise future purchases and stock.'
            : 'AI உதவியாளர் இந்த தகவலை நினைவில் கொண்டு எதிர்கால கேள்விகளுக்கு துல்லியமாக பதிலளிக்கும்.'
        }
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddMemory} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isEnglish ? 'Category *' : 'பிரிவு (Category) *'}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
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
              {isEnglish ? 'Title *' : 'தலைப்பு (Title) *'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isEnglish ? 'Ex: Diwali sweet orders supplier credit term' : 'எ.கா: தீபாவளி இனிப்பு ஆர்டர் சப்ளையர் விதி'}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isEnglish ? 'Content / Rule Details *' : 'விவரம் (Content / Rule) *'}
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isEnglish ? 'Write your business rule, customer note, or supplier condition...' : 'குறிப்பு அல்லது விதியை விரிவாக எழுதவும்...'}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isEnglish ? 'Tags (comma separated)' : 'குறியீடுகள் (Tags - comma separated)'}
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder={isEnglish ? 'diwali, sweets, supplier' : 'தீபாவளி, இனிப்பு, சப்ளையர்'}
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
            >
              {isEnglish ? 'Save to Memory' : 'நினைவில் சேமி (Save to AI Memory)'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
