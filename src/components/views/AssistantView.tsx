import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  Bot,
  User as UserIcon,
  Sparkles,
  Database,
  TrendingUp,
  Volume2,
  VolumeX,
  MessageSquarePlus,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';
import { AIMessage } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface AssistantViewProps {
  onOpenVoice: () => void;
  initialQuery?: string;
}

export const AssistantView: React.FC<AssistantViewProps> = ({ onOpenVoice, initialQuery }) => {
  const { user, business } = useAuth();
  const { language } = useLanguage();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [conversationsList, setConversationsList] = useState<any[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { text: 'இன்று sales எவ்வளவு?', category: 'விற்பனை' },
    { text: 'Inniku sales evlo?', category: 'Tanglish' },
    { text: 'Ravi oda pending amount evlo?', category: 'கடன் ஏடு' },
    { text: 'Ravi-ku 500 rupees credit add pannu', category: 'கடன் சேர்க்க' },
    { text: 'Enna stock kammiya irukku?', category: 'சரக்கு இருப்பு' },
    { text: 'Mudra loan pathi sollu', category: 'அரசு திட்டம்' },
    { text: 'Business improve panna enna panlam?', category: 'வணிக ஆலோசனை' },
  ];

  const loadConversations = async () => {
    try {
      const list = await api.getAssistantConversations();
      setConversationsList(list);
    } catch (err) {
      console.warn('Failed to load conversations:', err);
    }
  };

  useEffect(() => {
    loadConversations();
    // Default welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          conversationId: 'welcome',
          sender: 'ASSISTANT',
          text: `வணக்கம் ${business?.ownerName || user?.name || 'உரிமையாளரே'}! நான் உங்கள் வணிகத்தின் **உரிமையாளர் AI (Urimaiyalar AI)**.\n\nஉங்கள் கடையின் இன்றைய விற்பனை, வாடிக்கையாளர் கடன் நிலுவை, சரக்கு இருப்பு, கொள்முதல் அல்லது தமிழ்நாடு அரசு மானியத் திட்டங்கள் குறித்து தமிழில் என்னிடம் கேட்கலாம்.`,
          createdAt: new Date().toISOString(),
          dataInsight: {
            type: 'WELCOME',
            keyMetric: 'வணிக நிலை',
            value: 'நேரடி கண்காணிப்பில்',
            recommendation: 'கீழே உள்ள விரைவு வினாக்களை கிளிக் செய்யலாம் அல்லது மைக்கில் பேசலாம்.',
          },
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || loading) return;

    setInputQuery('');
    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      conversationId: conversationId || 'active',
      sender: 'USER',
      text: q,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await api.sendAssistantQuery(q, conversationId);
      if (response && response.message) {
        setMessages((prev) => [...prev, response.message]);
        if (response.conversationId) {
          setConversationId(response.conversationId);
          loadConversations();
        }
      }
    } catch (err: any) {
      console.error('Error querying assistant:', err);
      const errorMsg: AIMessage = {
        id: `err-${Date.now()}`,
        conversationId: conversationId || 'active',
        sender: 'ASSISTANT',
        text: 'மன்னிக்கவும், தகவலைப் பெறுவதில் சிக்கல் ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = () => {
    setConversationId(undefined);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        conversationId: 'new',
        sender: 'ASSISTANT',
        text: 'புதிய உரையாடல் தொடங்கப்பட்டுள்ளது. உங்கள் வணிகக் கேள்விகளைக் கேட்கலாம்.',
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const loadPastConversation = async (id: string) => {
    try {
      const conv = await api.getConversationDetail(id);
      if (conv && conv.messages) {
        setConversationId(conv.id);
        setMessages(conv.messages);
      }
    } catch (err) {
      console.warn('Failed to load past conversation:', err);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      // Strip markdown asterisks and bullets
      const cleanText = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Find Tamil voice if available
      const voices = window.speechSynthesis.getVoices();
      const tamilVoice = voices.find((v) => v.lang.includes('ta') || v.name.includes('Tamil'));
      if (tamilVoice) {
        utterance.voice = tamilVoice;
      }
      utterance.rate = 0.95;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col lg:flex-row gap-4 animate-in fade-in duration-300">
      {/* Left Sidebar: Conversations & Quick Prompts */}
      <div className="hidden lg:flex flex-col w-72 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              உரையாடல்கள் (Chats)
            </span>
          </div>
          <button
            id="assistant-new-chat-btn"
            onClick={startNewConversation}
            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
            title="புதிய உரையாடல்"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto my-3 space-y-1.5 scrollbar-thin">
          {conversationsList.length > 0 ? (
            conversationsList.map((c) => (
              <button
                key={c.id}
                onClick={() => loadPastConversation(c.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all ${
                  conversationId === c.id
                    ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <p className="truncate">{c.title || 'வணிக உரையாடல்'}</p>
                <span className="text-[10px] text-slate-400">
                  {new Date(c.updatedAt).toLocaleDateString('en-IN')}
                </span>
              </button>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              முந்தைய உரையாடல்கள் இல்லை
            </div>
          )}
        </div>

        {/* Grounding Status badge */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            உண்மைத் தரவு அடிப்படையிலானது (100% Grounded in Live Business DB)
          </span>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Chat Header */}
        <div className="p-3.5 px-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              உ
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                உரிமையாளர் AI உதவியாளர்
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  LIVE DB
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Grounded Tamil Business Intelligence • Gemini 3.8 Flash
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="assistant-voice-btn"
              onClick={onOpenVoice}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>குரலில் பேச (Voice)</span>
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
          {messages.map((msg) => {
            const isAssistant = msg.sender === 'ASSISTANT';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
              >
                {isAssistant && (
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-1 shadow-xs">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs lg:text-sm leading-relaxed ${
                    isAssistant
                      ? 'bg-slate-50 text-slate-800 border border-slate-200/80 shadow-xs'
                      : 'bg-emerald-600 text-white shadow-xs font-medium'
                  }`}
                >
                  {/* Assistant Text */}
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Tool Execution Badges */}
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Database className="w-3 h-3 text-emerald-600" />
                        இயக்கப்பட்ட கருவிகள் (Database Tools):
                      </span>
                      {msg.toolCalls.map((tc, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold"
                        >
                          {tc.tool}()
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Grounded Data Insight Card */}
                  {msg.dataInsight && (
                    <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1 text-slate-800">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                          {msg.dataInsight.keyMetric || 'முக்கிய தகவல்'}
                        </span>
                        {msg.dataInsight.value && (
                          <span className="text-sm font-extrabold text-slate-900">
                            {msg.dataInsight.value}
                          </span>
                        )}
                      </div>
                      {msg.dataInsight.recommendation && (
                        <p className="text-xs text-slate-600 pt-1 border-t border-slate-100 flex items-start gap-1">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{msg.dataInsight.recommendation}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Voice speak button for assistant messages */}
                  {isAssistant && (
                    <div className="mt-2 flex items-center justify-end">
                      <button
                        onClick={() => speakText(msg.text)}
                        className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-slate-200/50 transition-colors"
                        title={isSpeaking ? 'நிறுத்து' : 'கேட்க (Read Aloud)'}
                      >
                        {isSpeaking ? (
                          <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {!isAssistant && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-1 shadow-xs">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading bubble */}
          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xs font-bold animate-pulse">
                AI
              </div>
              <div className="p-3 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                வணிகத் தரவுகளைப் பகுப்பாய்வு செய்கிறது (Analyzing Database)...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            கேளுங்கள்:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              id={`assistant-quick-chip-${idx}`}
              onClick={() => handleSend(p.text)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs border border-slate-200/80 shrink-0 transition-colors"
            >
              {p.text}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 lg:p-4 border-t border-slate-100 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              id="assistant-query-input"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="தமிழிலோ, Tanglish-லோ அல்லது ஆங்கிலத்திலோ கேளுங்கள்..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs lg:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
            />

            <button
              type="button"
              id="assistant-mic-input-btn"
              onClick={onOpenVoice}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Voice Input"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              type="submit"
              id="assistant-send-query-btn"
              disabled={!inputQuery.trim() || loading}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <span>அனுப்பு</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
