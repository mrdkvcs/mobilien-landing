"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ChartRenderer from './ChartRenderer';

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
  }, [messages]);

  const sendMessage = async () => {
    const message = inputValue.trim();
    if (!message || isLoading) return;

    // Add user message
    const userMessage: Message = { role: "user", content: message };
    console.log('[Chat] Adding user message:', userMessage);
    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      console.log('[Chat] Messages after adding user:', newMessages);
      return newMessages;
    });
    setInputValue("");
    setIsLoading(true);

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
        content: data.reply || "Sajnálom, nem tudok válaszolni." 
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = { 
        role: "assistant", 
        content: "Hiba történt a kapcsolatban. Kérlek próbáld újra." 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-[460px] flex flex-col" style={{ maxHeight: '460px', height: '460px' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Mobi</h3>
              <p className="text-sm text-gray-600">Az Ön e-mobilitási asszisztense</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-visible px-6 py-4 space-y-4" style={{ maxHeight: 'calc(460px - 160px)', height: 'auto' }}>
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Bot className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>Kérdezz valós idejű töltési árakról, vagy kérj személyre szabott EV-ajánlást a preferenciáid alapján.</p>
            </div>
          ) : (
            messages.map((message, index) => {
              console.log(`[Chat] Rendering message ${index}:`, message.role, message.content.substring(0, 50));
              return (
              <div
                key={`message-${index}-${message.role}`}
                className={`flex gap-3 motion-safe:animate-[fadeIn_.2s_ease-out] w-full ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
                style={{
                  visibility: 'visible',
                  opacity: 1,
                }}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "user"
                        ? "bg-blue-500"
                        : "bg-gray-100"
                    }`}
                  >
                    {message.role === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-2xl relative z-10 ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                    style={{
                      visibility: 'visible',
                      opacity: 1,
                    }}
                  >
                    {message.role === "user" ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    ) : (
                      <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-strong:text-gray-900 prose-strong:font-semibold prose-table:text-sm prose-table:border-collapse prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:px-3 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-td:border prose-td:border-gray-300 prose-td:px-3 prose-td:py-2 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({node, inline, className, children, ...props}) {
                              const match = /language-(\w+)/.exec(className || '');
                              const language = match ? match[1] : '';
                              
                              // If it's a chart code block, render ChartRenderer
                              if (language === 'chart' && !inline) {
                                try {
                                  const chartContent = String(children).trim();
                                  if (!chartContent || chartContent === 'null' || chartContent === 'undefined') {
                                    console.error('[AIChatWidget] Empty chart content');
                                    return <div className="text-orange-500 text-sm">Nincs grafikonadat a válaszban</div>;
                                  }
                                  return <ChartRenderer chartData={chartContent} />;
                                } catch (error) {
                                  console.error('[AIChatWidget] Chart render error:', error);
                                  return <div className="text-red-500 text-sm">Hiba a grafikon renderelésében</div>;
                                }
                              }
                              
                              // Otherwise render normal code
                              return inline ? (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              ) : (
                                <pre className="bg-gray-100 p-3 rounded overflow-x-auto">
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
                </div>
              </div>
              );
            })
          )}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4 flex-shrink-0">
          <div className="flex gap-3 items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Írd ide a kérdésed..."
              className="flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 flex-shrink-0 whitespace-nowrap"
            >
              <Send className="w-4 h-4" />
              <span>Küldés</span>
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

