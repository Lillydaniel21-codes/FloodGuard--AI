import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Globe,
  Loader2,
  RefreshCw,
  ChevronDown,
  Check,
} from 'lucide-react';
import { apiClient } from '../services/api';
import { SupportedLanguage } from '../types';

interface CopilotChatProps {
  analysisId: string | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  language: SupportedLanguage;
  verifiedClaims?: Array<{ metric: string; ground_truth_value: string }>;
  corrections?: string[];
}

interface LanguageMeta {
  code: SupportedLanguage;
  label: string;
  native: string;
  flag: string;
}

const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'ne', label: 'Nepali', native: 'नेपाली', flag: '🇳🇵' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
  { code: 'zh', label: 'Chinese', native: '中文', flag: '🇨🇳' },
];

const INITIAL_GREETINGS: Record<SupportedLanguage, string> = {
  en: 'Hello, I am your FloodGuard AI Situation Report Copilot. All my claims are strictly verified against deterministic geospatial calculations. How can I assist with your emergency coordination?',
  ne: 'नमस्ते! म FloodGuard AI विपद् स्थिति प्रतिवेदन सहायक हुँ। सबै तथ्यांकहरू प्रमाणित भू-उपग्रह विश्लेषणसँग मेल खान्छन्। म कसरी सहयोग गर्न सक्छु?',
  hi: 'नमस्ते! मैं FloodGuard AI स्थिति रिपोर्ट सहायक हूँ। सभी दावे सत्यापित भू-स्थानिक गणनाओं पर आधारित हैं। मैं आपकी क्या सहायता कर सकता हूँ?',
  te: 'నమస్కారం! నేను FloodGuard AI అత్యవసర పరిస్థితి నివేదిక సహాయకుడిని. నా అన్ని సమాచారాలు ఖచ్చితమైన శాటిలైట్ భౌగోళిక విశ్లేషణపై ఆధారపడి ఉంటాయి. నేను మీకు ఎలా సహాయపడగలను?',
  es: 'Hola, soy el copiloto de FloodGuard AI. Todas mis respuestas están verificadas con análisis geoespacial determinista. ¿En qué puedo ayudar?',
  fr: 'Bonjour, je suis le copilote FloodGuard AI. Toutes mes données sont vérifiées par analyse géospatiale déterministe. Comment puis-je vous aider ?',
  bn: 'নমস্কার! আমি FloodGuard AI দুর্যোগ পরিস্থিতি সহকারী। সমস্ত তথ্য কঠোরভাবে স্যাটেলাইট বিশ্লেষণে যাচাইকৃত। কীভাবে সাহায্য করতে পারি?',
  zh: '您好！我是 FloodGuard AI 态势研判副驾驶。所有研判数据均基于高精度遥感地理空间分析。请问有什么需要协助？',
};

const SUGGESTED_QUERIES: Record<SupportedLanguage, string[]> = {
  en: [
    'Which settlements are disconnected from hospitals?',
    'Which roads and bridges are severed?',
    'What are the sensor limitations and cloud cover?',
    'What areas require immediate ground verification?',
  ],
  ne: [
    'कुन कुन बस्तीहरू अस्पतालसँग विच्छेद भएका छन्?',
    'बाढीले कुन कुन सडक र पुलहरू अवरुद्ध पारेको छ?',
    'उपग्रह विश्लेषणका प्राविधिक सीमाहरू के के हुन्?',
    'स्थलगत प्रमाणीकरण गर्नुपर्ने मुख्य स्थानहरू कुन हुन्?',
  ],
  hi: [
    'कौन-सी बस्तियां अस्पतालों से पूरी तरह कट चुकी हैं?',
    'बाढ़ ने किन सड़कों और पुलों को नुकसान पहुंचाया है?',
    'उपग्रह विश्लेषण की तकनीकी सीमाएं क्या हैं?',
    'जमीनी सत्यापन की आवश्यकता वाले मुख्य क्षेत्र कौन-से हैं?',
  ],
  te: [
    'ఆసుపత్రుల నుండి ఏ గ్రామాలు పూర్తిగా వేరుపడ్డాయి?',
    'వరదల వల్ల ఏ రోడ్లు మరియు వంతెనలు తెగిపోయాయి?',
    'శాటిలైట్ సెన్సార్ల సాంకేతిక పరిమితులు ఏమిటి?',
    'వెంటనే క్షేత్రస్థాయిలో పరిశీలించాల్సిన ప్రాంతాలు ఏవి?',
  ],
  es: [
    '¿Qué asentamientos están desconectados de los hospitales?',
    '¿Cuáles son las carreteras y puentes cortados?',
    '¿Cuáles son las limitaciones y cobertura de nubes?',
    '¿Qué zonas requieren verificación terrestre inmediata?',
  ],
  fr: [
    'Quelles localités sont coupées des hôpitaux ?',
    'Quels axes routiers et ponts sont rompus ?',
    'Quelles sont les limites de détection et nuages ?',
    'Quelles zones nécessitent une vérification au sol ?',
  ],
  bn: [
    'কোন জনপদগুলি হাসপাতাল থেকে যোগাযোগ বিচ্ছিন্ন?',
    'কোন কোন সড়ক এবং সেতু ক্ষতিগ্রস্ত হয়েছে?',
    'উপগ্রহ সেন্সরের প্রযুক্তিগত সীমাবদ্ধতা কী?',
    'কোন এলাকাগুলিতে অবিলম্বে মাঠপর্যায়ে যাচাই প্রয়োজন?',
  ],
  zh: [
    '哪些村落与区域医院交通中断？',
    '哪些道路与关键桥梁被冲毁冲断？',
    '卫星雷达在云层与地形下的监测局限性是什么？',
    '哪些重点区域急需地面实勘核实？',
  ],
};

export const CopilotChat: React.FC<CopilotChatProps> = ({ analysisId }) => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: INITIAL_GREETINGS['en'],
      language: 'en',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectLanguage = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    setIsLangMenuOpen(false);
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: INITIAL_GREETINGS[newLang],
        language: newLang,
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || !analysisId || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: text,
      language: language,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      const response = await apiClient.copilotChat(analysisId, text, language);
      const assistantMsg: Message = {
        role: 'assistant',
        content: response.reply,
        language: (response.language as SupportedLanguage) || language,
        verifiedClaims: response.verified_claims,
        corrections: response.corrections_applied,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Error: Failed to obtain copilot response from server.',
          language: language,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="flex flex-col h-full bg-dark-900 border border-dark-800 rounded-lg overflow-hidden select-none text-xs">
      {/* Header & Language Toggle */}
      <div className="p-3 bg-dark-850 border-b border-dark-800 flex items-center justify-between relative z-20">
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-100">AI SitRep Copilot</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
            7-Lang Mode
          </span>
        </div>

        {/* 7-Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center space-x-1.5 px-2 py-1 rounded bg-dark-900 border border-dark-750 text-slate-200 hover:text-cyan-300 transition text-[11px] font-bold"
          >
            <span>{currentLangMeta.flag}</span>
            <span>{currentLangMeta.native}</span>
            <ChevronDown className="w-3 h-3 text-cyan-400" />
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-dark-900 border border-dark-700 rounded-lg shadow-xl py-1 z-50 text-[11px]">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => handleSelectLanguage(l.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-1 text-left hover:bg-dark-800 transition ${
                    language === l.code ? 'text-cyan-400 font-bold bg-cyan-950/40' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{l.flag}</span>
                    <span>{l.native}</span>
                  </div>
                  {language === l.code && <Check className="w-3 h-3 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2 bg-dark-950/60 border-b border-dark-800 flex items-center space-x-1.5 overflow-x-auto text-[10px]">
        <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
        {(SUGGESTED_QUERIES[language] || SUGGESTED_QUERIES['en']).map((q, idx) => (
          <button
            key={idx}
            disabled={!analysisId || isLoading}
            onClick={() => handleSendMessage(q)}
            className="px-2 py-1 bg-dark-800 hover:bg-dark-700 text-slate-300 rounded whitespace-nowrap border border-dark-700 transition-all disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              m.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-2.5 shadow-sm ${
                m.role === 'user'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-dark-850 text-slate-200 border border-dark-750'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>

              {/* Verified Ground Truth Badge */}
              {m.verifiedClaims && m.verifiedClaims.length > 0 && (
                <div className="mt-2 pt-2 border-t border-cyan-800/40 text-[10px] space-y-0.5">
                  <div className="flex items-center space-x-1 text-cyan-400 font-semibold">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Grounded Claims:</span>
                  </div>
                  {m.verifiedClaims.map((c, i) => (
                    <div key={i} className="text-slate-300 font-mono">
                      • {c.metric}: <span className="text-cyan-300 font-bold">{c.ground_truth_value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Hallucination Filter Badge */}
              {m.corrections && m.corrections.length > 0 && (
                <div className="mt-1.5 text-[10px] text-amber-300 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>Hallucination check applied: ungrounded assumptions corrected.</span>
                </div>
              )}
            </div>
            <span className="text-[9px] text-slate-500 mt-0.5 px-1 uppercase font-mono">
              {m.language}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 text-cyan-400 bg-dark-850 p-2 rounded w-fit">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-[11px] text-slate-400">Verifying geospatial facts...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-2.5 bg-dark-850 border-t border-dark-800 flex items-center space-x-1.5">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          disabled={!analysisId || isLoading}
          placeholder="Ask a question grounded in satellite analysis..."
          className="flex-1 bg-dark-900 border border-dark-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition disabled:opacity-50"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputValue.trim() || !analysisId || isLoading}
          className="p-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
