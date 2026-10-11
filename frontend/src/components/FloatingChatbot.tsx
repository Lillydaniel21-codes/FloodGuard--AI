import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Loader2,
  ChevronDown,
  Minimize2,
  Maximize2,
  Check,
} from 'lucide-react';
import { apiClient } from '../services/api';
import { SupportedLanguage } from '../types';

interface FloatingChatbotProps {
  currentAnalysisId?: string | null;
  isOpen?: boolean;
  onToggleOpen?: (open: boolean) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  language: SupportedLanguage;
  timestamp: string;
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
  en: 'Hello! I am your FloodGuard AI Emergency Intelligence Assistant. I provide real-time situational insights on flood extent, damaged infrastructure, severed bridges, and isolated settlements grounded directly in satellite SAR data. How can I assist you?',
  ne: 'नमस्ते! म FloodGuard AI आपत्कालीन गुप्तचर सहायक हुँ। म उपग्रह राडार तथ्याङ्कमा आधारित बाढी क्षेत्र, क्षतिग्रस्त सडक, अवरुद्ध पुलहरू र विच्छेद भएका बस्तीहरूको वास्तविक अवस्थाबारे जानकारी दिन्छु। म कसरी सहयोग गर्न सक्छु?',
  hi: 'नमस्ते! मैं FloodGuard AI आपातकालीन स्थिति सहायक हूँ। मैं उपग्रह राडार डेटा के आधार पर बाढ़ क्षेत्र, क्षतिग्रस्त बुनियादी ढांचे, कटे हुए पुलों और अलग-थलग बस्तियों की सटीक जानकारी प्रदान करता हूँ। मैं आपकी क्या मदद कर सकता हूँ?',
  te: 'నమస్కారం! నేను FloodGuard AI అత్యవసర విపత్తు నిర్వహణ సహాయకుడిని. ఉపగ్రహ రాడార్ డేటా ఆధారంగా వరద విస్తీర్ణం, దెబ్బతిన్న రోడ్లు, తెగిపోయిన వంతెనలు మరియు రహదారి సంబంధాలు తెగిపోయిన గ్రామాల గురించి ఖచ్చితమైన సమాచారాన్ని అందిస్తాను. నేను మీకు ఎలా సహాయపడగలను?',
  es: '¡Hola! Soy el Asistente de Inteligencia de Emergencia FloodGuard AI. Proporciono información en tiempo real sobre la extensión de la inundación, infraestructura dañada, puentes cortados y asentamientos aislados basada en datos de radar SAR satelital. ¿Cómo puedo ayudarle?',
  fr: "Bonjour ! Je suis l'assistant d'intelligence d'urgence FloodGuard AI. Je fournis des informations en temps réel sur l'étendue des inondations, les infrastructures endommagées, les ponts coupés et les villages isolés grâce aux données radar SAR. Comment puis-je vous aider ?",
  bn: 'নমস্কার! আমি FloodGuard AI জরুরি দুর্যোগ সহকারী। আমি স্যাটেলাইট রাডার তথ্যের ভিত্তিতে বন্যার বিস্তৃতি, ক্ষতিগ্রস্ত সড়ক ও সেতু এবং বিচ্ছিন্ন জনপদের রিয়েল-টাইম তথ্য প্রদান করি। আমি কীভাবে আপনাকে সহায়তা করতে পারি?',
  zh: '您好！我是 FloodGuard AI 应急态势感知研判助手。基于合成孔径雷达（SAR）卫星监测数据，我能为您提供淹没范围、受损道路桥梁及隔绝村落的实时研判与应急疏散分析。请问有什么可以协助您？',
};

const QUICK_PROMPTS: Record<SupportedLanguage, string[]> = {
  en: [
    'Which bridges are severed in Trishuli?',
    'How many settlements are cut off from road access?',
    'What is the recommended evacuation zone?',
    'Why is Sentinel-1 SAR used instead of optical?',
  ],
  ne: [
    'त्रिशुलीमा कुन कुन पुलहरू बाढीले बगाएको छ?',
    'कतिवटा गाउँहरू सडक सम्पर्कबाट विच्छेद भएका छन्?',
    'हेलिकप्टर उद्धारका लागि उपयुक्त क्षेत्र कुन हो?',
    'बादल लाग्दा पनि भूउपग्रहले कसरी बाढी देख्छ?',
  ],
  hi: [
    'त्रिशूली में कौन-से पुल बाढ़ से क्षतिग्रस्त हुए हैं?',
    'कितनी बस्तियां सड़क संपर्क से कट चुकी हैं?',
    'हेलिकॉप्टर राहत के लिए सुरक्षित क्षेत्र कौन-सा है?',
    'बादलों के बावजूद राडार बाढ़ का पता कैसे लगाता है?',
  ],
  te: [
    'త్రిశూలి నదీ పరీవాహక ప్రాంతంలో ఏ వంతెనలు దెబ్బతిన్నాయి?',
    'ఎన్ని గ్రామాలు లేదా ఆవాసాలు రహదారి సంబంధాలను కోల్పోయాయి?',
    'హెలికాప్టర్ ద్వారా రక్షణ చర్యలకు అనువైన ప్రాంతం ఏది?',
    'దట్టమైన మేఘాలు ఉన్నప్పటికీ శాటిలైట్ రాడార్ వరదలను ఎలా గుర్తిస్తుంది?',
  ],
  es: [
    '¿Qué puentes están cortados en Trishuli?',
    '¿Cuántos asentamientos están aislados por carretera?',
    '¿Cuál es la zona recomendada para evacuación aérea?',
    '¿Cómo detecta el radar SAR la inundación bajo nubes?',
  ],
  fr: [
    'Quels ponts sont coupés dans la vallée de Trishuli ?',
    'Combien de villages sont coupés de tout accès routier ?',
    'Quelle est la zone recommandée pour l\'évacuation hélicoptère ?',
    'Comment le radar SAR détecte-t-il l\'eau à travers les nuages ?',
  ],
  bn: [
    'ত্রিশুলিতে কোন কোন সেতু বন্যায় ক্ষতিগ্রস্ত হয়েছে?',
    'কতগুলি জনপদ সড়ক যোগাযোগ থেকে সম্পূর্ণ বিচ্ছিন্ন?',
    'হেলিকপ্টার উদ্ধার ও ত্রাণের জন্য নিরাপদ অঞ্চল কোনটি?',
    'ঘন মেঘের মধ্যেও সার রাডার কীভাবে বন্যা সনাক্ত করে?',
  ],
  zh: [
    '特里苏利流域有哪些桥梁被冲毁？',
    '有多少个村落完全失去了道路交通？',
    '推荐的直升机应急疏散与空投降落区在哪里？',
    '合成孔径雷达SAR如何在云层覆盖下探测洪水？',
  ],
};

const PLACEHOLDERS: Record<SupportedLanguage, string> = {
  en: 'Ask about flood extents, cut-off villages, roads...',
  ne: 'बाढी, सडक वा उद्धारबारे सोध्नुहोस्...',
  hi: 'बाढ़, क्षतिग्रस्त सड़कों या बचाव कार्य के बारे में पूछें...',
  te: 'వరదలు, తెగిపోయిన వంతెనలు, సహాయక చర్యల గురించి అడగండి...',
  es: 'Pregunte sobre inundaciones, pueblos aislados, carreteras...',
  fr: 'Posez une question sur les inondations, ponts, villages...',
  bn: 'বন্যা, বিচ্ছিন্ন জনপদ বা উদ্ধার অভিযান সম্পর্কে জিজ্ঞাসা করুন...',
  zh: '输入关于洪水淹没、断联村落、损毁桥梁的问题...',
};

const ERROR_MESSAGES: Record<SupportedLanguage, string> = {
  en: 'Unable to connect to FloodGuard intelligence server. Please verify network or try again.',
  ne: 'क्षमा गर्नुहोस्, प्रणालीसँग सम्पर्क हुन सकेन। कृपया फेरि प्रयास गर्नुहोस्।',
  hi: 'क्षमा करें, सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।',
  te: 'క్షమించండి, సర్వర్‌తో కనెక్షన్ ఏర్పడలేదు. దయచేసి నెట్‌వర్క్ తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.',
  es: 'No se pudo conectar con el servidor de inteligencia. Por favor verifique la red e intente de nuevo.',
  fr: 'Impossible de contacter le serveur d\'intelligence. Veuillez vérifier la connexion et réessayer.',
  bn: 'দুঃখিত, সার্ভারের সাথে সংযোগ করা সম্ভব হয়নি। দয়া করে পুনরায় চেষ্টা করুন।',
  zh: '无法连接到应急情报研判服务器，请检查网络后重试。',
};

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({
  currentAnalysisId,
  isOpen: externalIsOpen,
  onToggleOpen,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (val: boolean) => {
    setInternalIsOpen(val);
    if (onToggleOpen) onToggleOpen(val);
  };

  const [isMinimized, setIsMinimized] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: INITIAL_GREETINGS['en'],
      language: 'en',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  // When language switches, append a greeting or switch prompt context
  const handleSelectLanguage = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    setIsLangMenuOpen(false);

    // Add a transition greeting from the bot in the newly selected language
    const langGreeting: ChatMessage = {
      id: `lang-${Date.now()}`,
      role: 'assistant',
      content: INITIAL_GREETINGS[newLang],
      language: newLang,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, langGreeting]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    const newMsgId = `usr-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: newMsgId,
      role: 'user',
      content: text,
      language: language,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      let replyText = '';
      let verified: any[] = [];
      let corrections: string[] = [];
      let resLang: SupportedLanguage = language;

      if (currentAnalysisId) {
        const res = await apiClient.copilotChat(currentAnalysisId, text, language);
        replyText = res.reply;
        verified = res.verified_claims || [];
        corrections = res.corrections_applied || [];
        resLang = (res.language as SupportedLanguage) || language;
      } else {
        const res = await apiClient.globalCopilotChat(text, language);
        replyText = res.reply;
        verified = res.verified_claims || [];
        corrections = res.corrections_applied || [];
        resLang = (res.language as SupportedLanguage) || language;
      }

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        language: resLang,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        verifiedClaims: verified,
        corrections: corrections,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: ERROR_MESSAGES[language] || ERROR_MESSAGES['en'],
        language: language,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-auto">
      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className={`mb-3 w-[92vw] sm:w-[440px] bg-dark-900/98 backdrop-blur-md border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/70 flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-[560px] max-h-[82vh]'
          }`}
        >
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-gradient-to-r from-dark-950 via-dark-900 to-cyan-950/60 border-b border-cyan-500/20 flex items-center justify-between select-none relative z-20">
            <div className="flex items-center space-x-2.5">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/30">
                <Bot className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-xs sm:text-sm text-white tracking-tight">
                    FloodGuard Copilot
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-700/50 rounded font-semibold">
                    7-LANG AI
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>SAR Grounded Intelligence</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1 relative">
              {/* 7 Languages Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  title="Select AI Conversation Language (7 Languages Available)"
                  className="flex items-center space-x-1 px-2 py-1 text-xs font-semibold rounded-lg bg-dark-800 text-cyan-300 hover:bg-dark-750 border border-dark-700 transition"
                >
                  <span>{currentLangMeta.flag}</span>
                  <span className="text-[11px] font-bold">{currentLangMeta.native}</span>
                  <ChevronDown className="w-3 h-3 text-cyan-400" />
                </button>

                {isLangMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-44 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl py-1 z-50 text-xs">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-dark-800">
                      Select Language (7)
                    </div>
                    {SUPPORTED_LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => handleSelectLanguage(l.code)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left hover:bg-dark-800 transition ${
                          language === l.code ? 'text-cyan-400 font-bold bg-cyan-950/40' : 'text-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span>{l.flag}</span>
                          <span>{l.native}</span>
                        </div>
                        {language === l.code && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Minimize */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-dark-800 rounded-md transition"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-dark-800 rounded-md transition"
                title="Close Chat"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                          : 'bg-dark-850/90 border border-dark-750 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                      {/* Verified Claims Badge */}
                      {msg.verifiedClaims && msg.verifiedClaims.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-cyan-800/40 text-[10px] space-y-1">
                          <div className="flex items-center space-x-1 text-cyan-400 font-semibold">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>Grounded Geospatial Verification:</span>
                          </div>
                          {msg.verifiedClaims.map((claim, idx) => (
                            <div key={idx} className="text-slate-300 font-mono">
                              • {claim.metric}: <span className="text-cyan-300 font-bold">{claim.ground_truth_value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Corrections Badge */}
                      {msg.corrections && msg.corrections.length > 0 && (
                        <div className="mt-1.5 text-[10px] text-amber-300 flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>Hallucination check applied: ungrounded assumptions corrected.</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-[10px] text-slate-500 mt-1 px-1">
                      <span>{msg.timestamp}</span>
                      <span>•</span>
                      <span className="uppercase font-mono">{msg.language}</span>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center space-x-2 text-cyan-400 bg-dark-850/60 border border-dark-750 rounded-xl px-3 py-2 w-fit">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="text-xs text-slate-400 animate-pulse">
                      Analyzing satellite data & road topology...
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Chips in Active Language */}
              <div className="px-3 py-2 bg-dark-950/70 border-t border-dark-800">
                <div className="flex items-center space-x-1 text-[10px] text-slate-400 mb-1.5">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>{currentLangMeta.flag} Suggested queries ({currentLangMeta.native}):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(QUICK_PROMPTS[language] || QUICK_PROMPTS['en']).slice(0, 3).map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="px-2.5 py-1 text-[11px] rounded-full bg-dark-800/80 hover:bg-cyan-950 hover:text-cyan-300 text-slate-300 border border-dark-700 hover:border-cyan-700/60 transition text-left truncate max-w-full"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Bar */}
              <div className="p-3 bg-dark-900 border-t border-dark-800 flex items-center space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={PLACEHOLDERS[language] || PLACEHOLDERS['en']}
                  className="flex-1 bg-dark-950 text-slate-100 placeholder-slate-500 text-xs px-3.5 py-2.5 rounded-xl border border-dark-700 focus:outline-none focus:border-cyan-500 transition"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md shadow-cyan-900/30"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Launcher Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        className="group relative flex items-center space-x-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium shadow-xl shadow-cyan-950/80 border border-cyan-400/30 transition-all duration-300 hover:scale-105 active:scale-95"
        title="FloodGuard AI Emergency Copilot"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-white animate-bounce" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold tracking-wide hidden sm:inline">
            {isOpen ? 'Close Copilot' : 'Chat with AI'}
          </span>
          <span className="text-[9px] text-cyan-200 font-mono hidden sm:inline">
            7 Languages
          </span>
        </div>
      </button>
    </div>
  );
};
