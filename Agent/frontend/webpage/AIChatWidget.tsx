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
  
  // File attachment states
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Audio recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isSendingAudio, setIsSendingAudio] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordedMimeType, setRecordedMimeType] = useState<string>('');
  const [useWebSpeech, setUseWebSpeech] = useState(true);
  const recognitionRef = useRef<any>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isAutoStopping, setIsAutoStopping] = useState(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const isRecordingRef = useRef(false);

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

  // File handling functions
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
      e.target.value = ''; // Reset input
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const sendMessage = async () => {
    const message = inputValue.trim();
    const hasFiles = attachedFiles.length > 0;
    
    if ((!message && !hasFiles) || isLoading) return;

    // Expand chat when sending message (both mobile and desktop)
    setIsExpanded(true);

    // Ha van fájl, jelezzük az üzenetben
    let messageContent = message;
    if (hasFiles) {
      const fileNames = attachedFiles.map(f => `📎 ${f.name}`).join('\n');
      messageContent = message ? `${message}\n\n${fileNames}` : fileNames;
    }

    // Add user message
    const userMessage: Message = { 
      role: "user", 
      content: messageContent,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setErrorMsg("");

    try {
      if (hasFiles) {
        console.log('📎 Sending files:', attachedFiles.length);
        
        // Fájlok base64-re konvertálása
        const fileData = await Promise.all(
          attachedFiles.map(async (file) => ({
            name: file.name,
            type: file.type,
            size: file.size,
            data: await fileToBase64(file)
          }))
        );
        
        console.log('📎 Files converted to base64:', fileData.map(f => `${f.name} (${f.size} bytes)`));
        
        // Küldés a file-chat endpoint-ra (relatív URL - Next.js API route)
        const response = await fetch(`/api/file-chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            message: message || '', 
            files: fileData,
            sessionId: sessionId || undefined 
          }),
        });

        console.log('📥 File-chat response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ File-chat error:', errorData);
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ File-chat response received');
        
        // Store session ID if this is the first message
        if (data.sessionId && !sessionId) {
          setSessionId(data.sessionId);
          localStorage.setItem('chat-session-id', data.sessionId);
          console.log('[Chat] New session created:', data.sessionId);
        }
        
        const aiMessage: Message = { 
          role: "assistant", 
          content: data.reply || "Sajnálom, nem tudtam elemezni a fájlokat.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Fájlok törlése küldés után
        setAttachedFiles([]);
      } else {
        // Normál szöveges üzenet (Agent backend Express szerver)
        let API_URL = process.env.NEXT_PUBLIC_API_URL || 
          (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : 'https://api.mobilien.app');
        
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
      }
    } catch (error) {
      setErrorMsg("Hiba történt a kérés közben. Kérlek, próbáld újra.");
    } finally {
      setIsLoading(false);
    }
  };

  // Audio recording functions
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const sendTranscribedText = async (text: string) => {
    // Automatikus küldés a transcribed text-tel
    if (!text.trim() || isLoading) return;

    // Expand chat when sending message
    setIsExpanded(true);

    // Add user message
    const userMessage: Message = { 
      role: "user", 
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setErrorMsg("");

    try {
      // Agent backend Express szerver
      let API_URL = process.env.NEXT_PUBLIC_API_URL || 
        (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
          ? 'http://localhost:3000' 
          : 'https://api.mobilien.app');
      
      API_URL = API_URL.replace(/\/$/, '');
      
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: text,
          sessionId: sessionId || undefined 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem('chat-session-id', data.sessionId);
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

  const sendAudioToWhisper = async (audioBlob: Blob) => {
    setIsLoading(true);
    setErrorMsg('');

    const processingMessage: Message = {
      role: 'user',
      content: '🎤 Hang feldolgozása...',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, processingMessage]);

    try {
      const base64Audio = await blobToBase64(audioBlob);
      
      // Audio formátum meghatározása
      let audioFormat = 'webm';
      if (audioBlob.type.includes('mp4')) {
        audioFormat = 'mp4';
      } else if (audioBlob.type.includes('mpeg') || audioBlob.type.includes('mp3')) {
        audioFormat = 'mp3';
      } else if (audioBlob.type.includes('wav')) {
        audioFormat = 'wav';
      }
      
      // Next.js API route (relatív URL)
      const response = await fetch(`/api/audio-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          audioData: base64Audio,
          audioFormat: audioFormat,
          sessionId: sessionId || undefined 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update the processing message with transcribed text
      if (data.transcribedText) {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = data.transcribedText;
          return updated;
        });
      }

      // Store session ID if this is the first message
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem('chat-session-id', data.sessionId);
      }
      
      const aiMessage: Message = {
        role: 'assistant',
        content: data.reply || 'Sajnálom, nem tudtam feldolgozni a hangot.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Audio processing error:', error);
      setErrorMsg('Hiba történt a hang feldolgozása közben.');
      setMessages(prev => prev.slice(0, -1)); // Remove processing message
    } finally {
      setIsLoading(false);
    }
  };

  const startWebSpeech = async (SpeechRecognition: any) => {
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = 'hu-HU';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsSendingAudio(true);
      await sendTranscribedText(transcript);
      setIsSendingAudio(false);
    };

    recognition.onerror = async (event: any) => {
      if (event.error === 'network') {
        // Ha network hiba, váltunk MediaRecorder-re
        setUseWebSpeech(false);
        setErrorMsg('');
        setIsRecording(false);
        
        setTimeout(async () => {
          await startRecording();
        }, 100);
        return;
      }
      
      if (event.error === 'no-speech') {
        setErrorMsg('Nem hallottam semmit. Próbáld újra!');
      } else if (event.error === 'not-allowed') {
        setErrorMsg('Mikrofon hozzáférés megtagadva.');
      }
      
      setIsRecording(false);
      setIsSendingAudio(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const startMediaRecorder = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    setAudioChunks([]);
    
    // Web Audio API setup for audio level detection
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;
    
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    
    source.connect(analyser);
    
    // Audio level monitoring
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let lastSoundTime = Date.now();
    
    const checkAudioLevel = () => {
      if (!isRecordingRef.current) return;
      
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average);
      
      // Csend detektálás (threshold: 15 - csökkentett érzékenység)
      if (average > 15) {
        lastSoundTime = Date.now();
        // Töröljük a csend timer-t ha beszélünk
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      } else {
        // Ha 3 másodperce csend van
        const silenceDuration = Date.now() - lastSoundTime;
        if (silenceDuration > 3000 && !silenceTimerRef.current) {
          // Automatikus stop indítása
          console.log('🔴 3 seconds silence detected, auto-stopping...');
          silenceTimerRef.current = setTimeout(() => {
            autoStopRecording();
          }, 0);
        }
      }
      
      requestAnimationFrame(checkAudioLevel);
    };
    
    isRecordingRef.current = true;
    checkAudioLevel();
    
    // Automatikus formátum detektálás
    let mimeType = 'audio/webm;codecs=opus'; // Desktop default
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4'; // iOS Safari
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else {
        mimeType = '';
      }
    }

    setRecordedMimeType(mimeType);
    
    const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
    const recorder = new MediaRecorder(stream, options);
    setMediaRecorder(recorder);

    const chunks: Blob[] = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = async () => {
      const finalMimeType = recordedMimeType || recorder.mimeType || 'audio/webm';
      const audioBlob = new Blob(chunks, { type: finalMimeType });
      
      // Cleanup
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setAudioLevel(0);
      
      if (audioBlob.size === 0) {
        setErrorMsg('Nem sikerült rögzíteni a hangot. Próbáld újra!');
        stream.getTracks().forEach(track => track.stop());
        setIsAutoStopping(false);
        return;
      }
      
      setIsSendingAudio(true);
      await sendAudioToWhisper(audioBlob);
      setIsSendingAudio(false);
      setIsAutoStopping(false);
      
      stream.getTracks().forEach(track => track.stop());
    };

    recorder.start();
    setIsRecording(true);
  };

  const autoStopRecording = async () => {
    console.log('🔴 Auto-stopping: Red flash starting...');
    // Piros villogás fél másodpercig
    setIsAutoStopping(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('⏹️ Auto-stopping: Stopping recording now...');
    // Stop recording
    stopRecording();
  };

  const startRecording = async () => {
    try {
      setErrorMsg('');

      // iOS és Safari nem támogatja a Web Speech API-t
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      
      if (isIOS || isSafari) {
        await startMediaRecorder();
        return;
      }

      // Web Speech API ellenőrzés (csak nem-iOS platformokon)
      const SpeechRecognition = (window as any).SpeechRecognition || 
                                (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition && useWebSpeech) {
        await startWebSpeech(SpeechRecognition);
      } else {
        await startMediaRecorder();
      }
    } catch (error) {
      console.error('Hiba a hang rögzítés indításakor:', error);
      setErrorMsg('Nem sikerült elérni a mikrofont.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    // Cleanup timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    
    isRecordingRef.current = false;
    setIsRecording(false);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaFocus = () => {
    // Automatikusan nyisd ki a panelt, ha összecsukott állapotban van
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-0 relative z-10 overflow-x-hidden">
      <div className={`rounded-t-2xl overflow-hidden flex flex-col relative w-full transition-all duration-300 ${isExpanded ? 'h-[460px] md:h-[585px]' : 'h-auto'}`} style={{ zIndex: 10, maxHeight: isExpanded ? (typeof window !== 'undefined' && window.innerWidth >= 640 ? '585px' : '460px') : 'none', minHeight: isExpanded ? (typeof window !== 'undefined' && window.innerWidth >= 640 ? '585px' : '460px') : 'auto', overflowX: 'hidden', boxSizing: 'border-box' }}>
        {/* Background */}
        <div className="absolute inset-0" style={{ backgroundColor: 'rgb(3, 14, 19)' }}></div>

        <div className="relative flex flex-col h-full">
          {/* Header - Modern & Minimal */}
          <div className="backdrop-blur-xl bg-black/40 border-b border-white/10" style={{ overflowX: 'hidden' }}>
            <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between" style={{ overflowX: 'hidden', boxSizing: 'border-box' }}>
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
          <div ref={messagesContainerRef} className={`flex-1 overflow-y-auto overflow-x-hidden py-4 sm:py-6 messages-scroll ${isExpanded ? 'block' : 'hidden'}`} style={{ maxHeight: typeof window !== 'undefined' && window.innerWidth >= 640 ? 'calc(585px - 160px)' : 'calc(460px - 160px)', height: 'auto', overflowX: 'hidden', boxSizing: 'border-box' }}>
            <div className="px-4 sm:px-6 space-y-4" style={{ overflowX: 'hidden', boxSizing: 'border-box' }}>
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
                  }`} style={{ maxWidth: 'calc(100% - 3rem)', width: 'fit-content', overflowX: 'hidden', boxSizing: 'border-box' }}>
                    <div className={`px-4 py-2.5 sm:py-3 rounded-3xl backdrop-blur-xl ${
                      message.role === "assistant"
                        ? "border border-white/10 rounded-tl-md"
                        : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-600/30 rounded-tr-md"
                    }`}
                    style={message.role === "assistant" ? {
                      backgroundColor: 'rgba(24, 24, 27)',
                      color: 'rgba(247, 247, 248)',
                      overflowX: 'hidden',
                      wordWrap: 'break-word',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      boxSizing: 'border-box'
                    } : {
                      overflowX: 'hidden',
                      wordWrap: 'break-word',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      boxSizing: 'border-box'
                    }}>
                      {message.role === "user" ? (
                        <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(247, 247, 248)', overflowX: 'hidden', wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{message.content}</p>
                      ) : (
                        <div className="text-base leading-relaxed prose prose-sm max-w-none md:prose-headings:mt-3 md:prose-headings:mb-2 prose-p:my-2 md:prose-ul:my-2 md:prose-ol:my-2 prose-li:my-0.5 prose-strong:font-semibold prose-strong:text-inherit prose-headings:text-inherit prose-headings:text-base prose-h1:text-base prose-h2:text-base prose-h3:text-base prose-h4:text-base prose-h5:text-base prose-h6:text-base prose-code:text-inherit prose-code:bg-transparent prose-code:px-0 prose-code:py-0 prose-code:rounded-none prose-a:text-inherit prose-em:text-inherit prose-ul:text-inherit prose-ol:text-inherit prose-li:text-inherit md:prose-table:text-sm md:prose-table:border-collapse md:prose-th:border md:prose-th:border-white/20 md:prose-th:bg-white/5 md:prose-th:px-3 md:prose-th:py-2 md:prose-th:text-left md:prose-th:font-semibold md:prose-td:border md:prose-td:border-white/20 md:prose-td:px-3 md:prose-td:py-2"
                        style={{ color: 'rgba(247, 247, 248)', overflowX: 'hidden', wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word', boxSizing: 'border-box' }}>
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
                                  <pre className="bg-white/10 p-3 rounded border border-white/10" style={{ overflowX: typeof window !== 'undefined' && window.innerWidth < 640 ? 'hidden' : 'auto', wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: typeof window !== 'undefined' && window.innerWidth < 640 ? 'pre-wrap' : 'pre', boxSizing: 'border-box' }}>
                                    <code className={className} {...props} style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
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
          <div 
            className="backdrop-blur-xl bg-black/40 border-t border-white/10 mt-auto" 
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)', overflowX: 'hidden', boxSizing: 'border-box' }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* File list */}
            {attachedFiles.length > 0 && (
              <div className="px-4 sm:px-6 pt-2 flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-1.5">
                    <span className="text-xs text-white truncate max-w-[150px]">📎 {file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Drag & Drop overlay */}
            {isDragging && (
              <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm border-2 border-blue-500 border-dashed rounded-t-2xl flex items-center justify-center z-50">
                <div className="text-white text-lg font-semibold">📎 Húzd ide a fájlokat</div>
              </div>
            )}
            
            <div className="px-4 sm:px-6 pt-2 sm:pt-3 pb-2 sm:pb-3" style={{ paddingBottom: 'calc(0.5rem - 3px)', overflowX: 'hidden', boxSizing: 'border-box' }}>
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept=".txt,.pdf,.doc,.docx,.json,.csv,.md"
                className="hidden"
              />
              
              <div className="flex gap-2 items-center" style={{ overflowX: 'hidden', boxSizing: 'border-box' }}>
                <div className="flex-1 relative flex items-center">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    onFocus={handleTextareaFocus}
                    placeholder="Üzenet..."
                    className="w-full px-4 py-2.5 sm:py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl outline-none resize-none text-white placeholder-slate-500 text-sm sm:text-base focus:border-blue-500/50 transition-all chat-input"
                    rows={1}
                    style={{ maxHeight: '120px', minHeight: '42px', boxSizing: 'border-box', overflowX: 'hidden', wordWrap: 'break-word', wordBreak: 'break-word', fontSize: '16px' }}
                    disabled={isLoading || isSendingAudio}
                  />
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button 
                    onClick={handleFileButtonClick}
                    disabled={isLoading || isSendingAudio}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                  </button>

                  {inputValue.trim() === '' && attachedFiles.length === 0 ? (
                    isRecording ? (
                      <button 
                        onClick={stopRecording}
                        disabled={isLoading || isSendingAudio}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                      >
                        {/* Audio waveform visualization */}
                        <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                          {[...Array(5)].map((_, i) => {
                            // Szimmetrikus piramis: base magasság + audio reaktív rész
                            const baseHeights = [30, 45, 60, 45, 30]; // Fix base (%)
                            const audioMultipliers = [0.3, 0.4, 0.5, 0.4, 0.3]; // Audio reaktív
                            const dynamicHeight = Math.min(30, (audioLevel / 255) * 100 * audioMultipliers[i]);
                            const totalHeight = baseHeights[i] + dynamicHeight;
                            
                            return (
                              <div
                                key={i}
                                className={`w-0.5 rounded-full transition-all ${
                                  isAutoStopping ? 'bg-red-500' : 'bg-blue-500'
                                }`}
                                style={{
                                  height: `${totalHeight}%`,
                                  animation: 'pulse 0.8s ease-in-out infinite',
                                  animationDelay: `${i * 0.1}s`
                                }}
                              />
                            );
                          })}
                        </div>
                      </button>
                    ) : (
                      <button 
                        onClick={toggleRecording}
                        disabled={isLoading || isSendingAudio}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                      </button>
                    )
                  ) : (
                    <button
                      onClick={sendMessage}
                      disabled={isLoading || isSendingAudio}
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
            max-width: 100% !important;
            width: 100% !important;
            overflow-x: hidden !important;
            word-wrap: break-word !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
            box-sizing: border-box !important;
          }
          .prose strong {
            font-weight: 600 !important;
            color: rgba(247, 247, 248) !important;
          }
          .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
            font-size: 1rem !important;
            font-weight: normal !important;
            color: rgba(247, 247, 248) !important;
            max-width: 100% !important;
            width: 100% !important;
            overflow-x: hidden !important;
            box-sizing: border-box !important;
          }
          .prose code {
            background: transparent !important;
            color: rgba(247, 247, 248) !important;
            font-size: 1rem !important;
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            overflow-x: hidden !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
            white-space: pre-wrap !important;
            box-sizing: border-box !important;
          }
          .prose pre {
            max-width: 100% !important;
            width: 100% !important;
            overflow-x: hidden !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
            white-space: pre-wrap !important;
            box-sizing: border-box !important;
          }
          .prose a {
            color: rgba(247, 247, 248) !important;
            text-decoration: none !important;
            max-width: 100% !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
            box-sizing: border-box !important;
          }
          .prose em {
            font-style: normal !important;
            color: rgba(247, 247, 248) !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
          }
          .prose p, .prose ul, .prose ol, .prose li {
            max-width: 100% !important;
            width: 100% !important;
            overflow-x: hidden !important;
            word-wrap: break-word !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>
    </div>
  );
}

