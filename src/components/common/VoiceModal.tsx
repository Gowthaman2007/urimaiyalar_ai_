import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Volume2, Sparkles, ArrowRight } from 'lucide-react';
import { Modal } from './Modal';
import { useLanguage } from '../../context/LanguageContext';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitQuery?: (query: string) => void;
  onQueryProcessed?: (query: string) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onSubmitQuery,
  onQueryProcessed,
}) => {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [speechLang, setSpeechLang] = useState<'ta-IN' | 'en-IN'>('ta-IN');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript('');
      setErrorMsg(null);
    } else {
      // Auto start when modal opens
      startListening();
    }
  }, [isOpen]);

  const startListening = () => {
    setErrorMsg(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Browser speech recognition is not supported in this environment. You can type your query below.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access was denied. Please allow microphone permissions.');
        } else if (event.error === 'no-speech') {
          setErrorMsg('No speech detected. Please speak clearly into your microphone.');
        } else {
          setErrorMsg(`Voice input status: ${event.error}. You can also type or use suggestions.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setErrorMsg('Could not initialize speech recognition.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || transcript).trim();
    if (!text) return;
    stopListening();
    if (onSubmitQuery) onSubmitQuery(text);
    if (onQueryProcessed) onQueryProcessed(text);
    onClose();
  };

  const samplePrompts = [
    { text: 'இன்று sales எவ்வளவு?', label: 'இன்றைய விற்பனை (Sales)' },
    { text: 'Inniku sales evlo?', label: 'Inniku Sales (Tanglish)' },
    { text: 'Ravi oda pending amount evlo?', label: 'ரவி கடன் நிலுவை (Credit)' },
    { text: 'Enna stock kammiya irukku?', label: 'இருப்பு குறைவான பொருட்கள்' },
    { text: 'Business improve panna enna panlam?', label: 'வணிக ஆலோசனை (Advice)' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="உரிமையாளர் AI குரல் உதவியாளர்"
      subtitle="Speak in Tamil, English, or Tanglish for instant business intelligence"
      maxWidth="max-w-lg"
    >
      <div className="flex flex-col items-center text-center">
        {/* Language selector toggle */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
          <button
            id="voice-lang-ta-btn"
            onClick={() => {
              setSpeechLang('ta-IN');
              if (isListening) startListening();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              speechLang === 'ta-IN'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            தமிழ் (Tamil - இந்தியா)
          </button>
          <button
            id="voice-lang-en-btn"
            onClick={() => {
              setSpeechLang('en-IN');
              if (isListening) startListening();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              speechLang === 'en-IN'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            English / Tanglish
          </button>
        </div>

        {/* Animated Microphone Visualizer */}
        <div className="relative my-4 flex items-center justify-center">
          {isListening && (
            <>
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                className="absolute w-28 h-28 rounded-full bg-emerald-400/20"
              />
              <motion.div
                animate={{ scale: [1, 1.8, 1], opacity: [0.15, 0.4, 0.15] }}
                transition={{ repeat: Infinity, duration: 1.6, delay: 0.3, ease: 'easeInOut' }}
                className="absolute w-36 h-36 rounded-full bg-emerald-500/10"
              />
            </>
          )}

          <button
            id="voice-toggle-mic-btn"
            onClick={isListening ? stopListening : startListening}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${
              isListening
                ? 'bg-emerald-600 text-white shadow-emerald-500/30 ring-4 ring-emerald-200'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? (
              <Mic className="w-8 h-8 animate-pulse" />
            ) : (
              <MicOff className="w-8 h-8" />
            )}
          </button>
        </div>

        {/* Status text */}
        <p className="mt-2 text-sm font-medium text-slate-600">
          {isListening
            ? 'பேசுங்கள்... கவனித்துக் கொண்டிருக்கிறது (Listening...)'
            : 'மைக்கை கிளிக் செய்து பேசத் தொடங்குங்கள்'}
        </p>

        {errorMsg && (
          <p className="mt-2 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            {errorMsg}
          </p>
        )}

        {/* Live Transcript Box */}
        <div className="w-full mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left min-h-[90px] flex flex-col justify-between">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
            உரையாடல் / Transcript
          </p>
          <input
            type="text"
            id="voice-transcript-input"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="உங்கள் குரல் அல்லது தட்டச்சு செய்து கேளுங்கள்..."
            className="w-full bg-transparent text-slate-800 text-sm focus:outline-none placeholder:text-slate-400"
          />
          {transcript && (
            <div className="flex justify-end mt-2">
              <button
                id="voice-submit-transcript-btn"
                onClick={() => handleSend()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-all"
              >
                கேளுங்கள் (Ask AI)
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Quick Sample Prompts */}
        <div className="w-full mt-6 text-left">
          <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            உடனடி உதாரணக் கேள்விகள் (Quick Questions):
          </p>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((item, idx) => (
              <button
                key={idx}
                id={`voice-quick-prompt-${idx}`}
                onClick={() => handleSend(item.text)}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1 text-left"
              >
                <span>"{item.text}"</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
