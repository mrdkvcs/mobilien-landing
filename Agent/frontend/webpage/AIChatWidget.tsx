"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Mic, Paperclip, X } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ChartRenderer from './ChartRenderer';

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatWidgetProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export default function AIChatWidget({ isExpanded, setIsExpanded }: AIChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Szia! 👋 Miben segíthetek az e-mobilitással kapcsolatban?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize session ID from localStorage
  useEffect(() => {
    const storedSessionId = localStorage.getItem('chat-session-id');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      console.log('[Chat] Using existing session:', storedSessionId);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  // Scroll to input area when panel expands
  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  }, [isExpanded]);

  const sendMessage = async () => {
    const message = inputValue.trim();
    if (!message || isLoading) return;

    // Expand chat when sending message (both mobile and desktop)
    setIsExpanded(true);

    // Add user message
    const userMessage: Message = { 
      role: "user", 
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setErrorMsg("");

      try {
        // Automatikus környezet felismerés
        let API_URL = process.env.NEXT_PUBLIC_API_URL || 
          (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : 'https://api.mobilien.app');
        
        // Remove trailing slash if exists
        API_URL = API_URL.replace(/\/$/, '');
        
        const response = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            message,
            sessionId: sessionId || undefined 
          }),
        });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Store session ID if this is the first message
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem('chat-session-id', data.sessionId);
        console.log('[Chat] New session created:', data.sessionId);
      }
      
      const aiMessage: Message = { 
        role: "assistant", 
        content: data.reply || "Sajnálom, nem tudok válaszolni.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setErrorMsg("Hiba történt a kérés közben. Kérlek, próbáld újra.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-0 relative z-10 overflow-x-hidden">
      <div className={`rounded-t-2xl overflow-hidden flex flex-col relative w-full transition-all duration-300 ${isExpanded ? 'h-[460px] md:h-[585px]' : 'h-auto'}`} style={{ zIndex: 10, maxHeight: isExpanded ? (typeof window !== 'undefined' && window.innerWidth >= 640 ? '585px' : '460px') : 'none', minHeight: isExpanded ? (typeof window !== 'undefined' && window.innerWidth >= 640 ? '585px' : '460px') : 'auto', overflowX: 'hidden' }}>
        {/* Background */}
        <div className="absolute inset-0" style={{ backgroundColor: 'rgb(3, 14, 19)' }}></div>

        <div className="relative flex flex-col h-full">
          {/* Header - Modern & Minimal */}
          <div className="backdrop-blur-xl bg-black/40 border-b border-white/10">
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black"></div>
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-semibold text-white">Mobi AI</h1>
                  <p className="text-xs text-slate-400">online</p>
                </div>
              </div>
              <button
                className="text-cyan-500 hover:text-white transition-all duration-200 p-2 rounded-lg hover:bg-blue-800/20 active:bg-blue-800/30 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                onClick={() => {
                  // Collapse chat when clicking X (both mobile and desktop)
                  setIsExpanded(false);
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div ref={messagesContainerRef} className={`flex-1 overflow-y-auto overflow-x-hidden py-4 sm:py-6 messages-scroll ${isExpanded ? 'block' : 'hidden'}`} style={{ maxHeight: typeof window !== 'undefined' && window.innerWidth >= 640 ? 'calc(585px - 160px)' : 'calc(460px - 160px)', height: 'auto' }}>
            <div className="px-4 sm:px-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={`message-${index}-${message.role}`}
                  className={`flex gap-2 sm:gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}>
                    <div className={`px-4 py-2.5 sm:py-3 rounded-3xl backdrop-blur-xl ${
                      message.role === "assistant"
                        ? "border border-white/10 rounded-tl-md"
                        : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/30 rounded-tr-md"
                    }`}
                    style={message.role === "assistant" ? {
                      backgroundColor: 'rgba(24, 24, 27)',
                      color: 'rgba(247, 247, 248)'
                    } : undefined}>
                      {message.role === "user" ? (
                        <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(247, 247, 248)' }}>{message.content}</p>
                      ) : (
                        <div className="text-base leading-relaxed prose prose-sm max-w-none md:prose-headings:mt-3 md:prose-headings:mb-2 prose-p:my-2 md:prose-ul:my-2 md:prose-ol:my-2 prose-li:my-0.5 prose-strong:font-semibold prose-strong:text-inherit prose-headings:text-inherit prose-headings:text-base prose-h1:text-base prose-h2:text-base prose-h3:text-base prose-h4:text-base prose-h5:text-base prose-h6:text-base prose-code:text-inherit prose-code:bg-transparent prose-code:px-0 prose-code:py-0 prose-code:rounded-none prose-a:text-inherit prose-em:text-inherit prose-ul:text-inherit prose-ol:text-inherit prose-li:text-inherit md:prose-table:text-sm md:prose-table:border-collapse md:prose-th:border md:prose-th:border-white/20 md:prose-th:bg-white/5 md:prose-th:px-3 md:prose-th:py-2 md:prose-th:text-left md:prose-th:font-semibold md:prose-td:border md:prose-td:border-white/20 md:prose-td:px-3 md:prose-td:py-2"
                        style={{ color: 'rgba(247, 247, 248)' }}>
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({node, inline, className, children, ...props}: any) {
                                const match = /language-(\w+)/.exec(className || '');
                                const language = match ? match[1] : '';
                                
                                if (language === 'chart' && !inline) {
                                  try {
                                    const chartContent = String(children).trim();
                                    if (!chartContent || chartContent === 'null' || chartContent === 'undefined') {
                                      return <div className="text-orange-300 text-sm">Nincs grafikonadat a válaszban</div>;
                                    }
                                    return <ChartRenderer chartData={chartContent} />;
                                  } catch (error) {
                                    return <div className="text-red-300 text-sm">Hiba a grafikon renderelésében</div>;
                                  }
                                }
                                
                                return inline ? (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <pre className="bg-white/10 p-3 rounded overflow-x-auto border border-white/10">
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  </pre>
                                );
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-500 mt-1 px-2">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 sm:gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-3xl rounded-tl-md">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="text-red-400 text-xs sm:text-sm px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-xl">
                  {errorMsg}
                </div>
              )}
            </div>
          </div>

          {/* Input Area - Modern Style */}
          <div className="backdrop-blur-xl bg-black/40 border-t border-white/10 mt-auto" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}>
            <div className="px-4 sm:px-6 pt-2 sm:pt-3 pb-2 sm:pb-3" style={{ paddingBottom: 'calc(0.5rem - 3px)' }}>
              <div className="flex gap-2 items-center">
                <div className="flex-1 relative flex items-center">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Üzenet..."
                    className="w-full px-4 py-2.5 sm:py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl outline-none resize-none text-white placeholder-slate-500 text-sm sm:text-base focus:border-blue-500/50 transition-all chat-input"
                    rows={1}
                    style={{ maxHeight: '120px', minHeight: '42px' }}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all">
                    <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                  </button>

                  {inputValue.trim() === '' ? (
                    <button className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all">
                      <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                    </button>
                  ) : (
                    <button
                      onClick={sendMessage}
                      disabled={isLoading}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-600/50 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in-from-bottom-4 {
          from { transform: translateY(1rem); }
          to { transform: translateY(0); }
        }
        .animate-in {
          animation: fade-in 300ms ease-out, slide-in-from-bottom-4 300ms ease-out;
        }
        .fade-in { animation-name: fade-in; }
        .slide-in-from-bottom-4 { animation-name: slide-in-from-bottom-4; }
        .duration-300 { animation-duration: 300ms; }
        .chat-input {
          touch-action: manipulation;
          -webkit-user-select: text;
          user-select: text;
        }
        .chat-input:focus {
          scroll-margin: 0;
          scroll-padding: 0;
        }
        @media (min-width: 640px) {
          .chat-input {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .chat-input::-webkit-scrollbar {
            display: none;
          }
        }
        /* Messages scrollbar styling */
        .messages-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .messages-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(12px);
        }
        .messages-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .messages-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        .messages-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) rgba(0, 0, 0, 0.4);
        }
        /* Mobile: Unified text styling - only bold formatting allowed */
        @media (max-width: 639px) {
          .prose * {
            color: rgba(247, 247, 248) !important;
            font-size: 1rem !important;
            font-weight: normal !important;
          }
          .prose strong {
            font-weight: 600 !important;
            color: rgba(247, 247, 248) !important;
          }
          .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
            font-size: 1rem !important;
            font-weight: normal !important;
            color: rgba(247, 247, 248) !important;
          }
          .prose code {
            background: transparent !important;
            color: rgba(247, 247, 248) !important;
            font-size: 1rem !important;
            padding: 0 !important;
          }
          .prose a {
            color: rgba(247, 247, 248) !important;
            text-decoration: none !important;
          }
          .prose em {
            font-style: normal !important;
            color: rgba(247, 247, 248) !important;
          }
        }
      `}</style>
    </div>
  );
}

