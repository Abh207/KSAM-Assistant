import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import MessageBubble from './MessageBubble';
import VoiceInput from './VoiceInput';
import CameraPreview from './CameraPreview';
import KSAMLogo from './KSAMLogo';
import { Camera, Image as ImageIcon, Send, X } from 'lucide-react';
import type { Message } from '../types';

export default function ChatView() {
  const { chats, activeChatId, addChat, addMessage, updateMessage, updateChat, settings } = useAppStore();
  const [input, setInput] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isStreamingAny, setIsStreamingAny] = useState(false);
  
  const activeChat = chats.find(c => c.id === activeChatId);
  const messages = activeChat?.messages || [];
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsStreamingAny(messages.some(m => m.isStreaming));
  }, [messages]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isComposing) return;
    
    const text = input.trim();
    const image = selectedImage;
    
    setInput('');
    setSelectedImage(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsComposing(true);

    let currentChatId = activeChatId;
    if (!currentChatId) {
      currentChatId = crypto.randomUUID();
      addChat({
        id: currentChatId,
        title: text ? text.split(' ').slice(0, 4).join(' ') : 'New Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPinned: false
      });
      useAppStore.getState().setActiveChat(currentChatId);
    }

    const userMessageId = crypto.randomUUID();
    addMessage(currentChatId, {
      id: userMessageId,
      role: 'user',
      content: text,
      image: image || undefined,
      timestamp: new Date()
    });

    const assistantMessageId = crypto.randomUUID();
    addMessage(currentChatId, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      timestamp: new Date()
    });

    const systemInstruction = useAppStore.getState().plugins.find(p => p.isActive)?.instructions || 
      useAppStore.getState().projects.find(p => p.id === activeChat?.projectId)?.instructions || '';

    // Fire off title generation in the background for new chats
    if (messages.length === 0 && text) {
      fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: `Generate a 3 to 5 word title for this message. Reply ONLY with the title: "${text}"` })
      })
      .then(r => r.json())
      .then(d => {
        if (d.reply) updateChat(currentChatId, { title: d.reply.replace(/["']/g, '') });
      })
      .catch(console.error);
    }

    try {
      const history = (activeChat?.messages || []).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('http://localhost:3001/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, image, systemInstruction })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${res.status}`);
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.substring(6);
            if (dataStr === '[DONE]') break;
            try {
              const data = JSON.parse(dataStr);
              if (data.error) throw new Error(data.error);
              if (data.text) {
                fullText += data.text;
                updateMessage(currentChatId, assistantMessageId, { content: fullText });
              }
            } catch (e) {
              // ignore parse errors for partial chunks
            }
          }
        }
      }

      updateMessage(currentChatId, assistantMessageId, { 
        isStreaming: false, 
        suggestions: image 
          ? ['Tell me more', 'How much does this cost?', 'Where can I find this?']
          : ['Elaborate please', 'Give me an example']
      });

    } catch (error: any) {
      updateMessage(currentChatId, assistantMessageId, { 
        content: `⚠️ **Error**: ${error.message}`,
        isStreaming: false,
        suggestions: ['Retry']
      });
    } finally {
      setIsComposing(false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[var(--bg-base)] relative overflow-hidden ${isStreamingAny ? 'streaming-bg' : ''}`}>
      
      {/* Background drifting logos */}
      <div className="chat-bg-logos">
        <img src={KSAMLogo({}).props.src} className="chat-bg-logo chat-bg-logo-1" alt="" />
        <img src={KSAMLogo({}).props.src} className="chat-bg-logo chat-bg-logo-2" alt="" />
        <img src={KSAMLogo({}).props.src} className="chat-bg-logo chat-bg-logo-3" alt="" />
        <img src={KSAMLogo({}).props.src} className="chat-bg-logo chat-bg-logo-4" alt="" />
        <img src={KSAMLogo({}).props.src} className="chat-bg-logo chat-bg-logo-5" alt="" />
      </div>

      {showCamera && (
        <CameraPreview 
          onCapture={(img) => { setSelectedImage(img); setShowCamera(false); }}
          onClose={() => setShowCamera(false)}
        />
      )}
      {/* Top bar */}
      <div className="h-12 border-b border-[var(--border-color)] flex items-center px-4 justify-between bg-[var(--bg-base)]/80 backdrop-blur z-10 hidden md:flex">
        <h2 className="text-sm font-medium text-[var(--text-main)] truncate max-w-md">
          {activeChat?.title || 'New Chat'}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 w-full max-w-4xl mx-auto z-10 relative">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in max-w-lg mx-auto">
            <KSAMLogo className="w-24 h-24 mb-8 animate-logo-breathe" />
            <h2 className="text-3xl font-serif mb-2 text-gradient">Good afternoon, {settings.name || 'friend'}.</h2>
            <p className="text-[var(--text-muted)] mb-8">How can I help you today?</p>
            
            <div className="w-full text-left space-y-4">
              <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Try asking</h3>
              
              <button onClick={() => setInput("Draft a polite email declining a meeting invitation.")} className="w-full text-left group">
                <div className="text-sm text-[var(--text-main)] font-medium group-hover:text-[var(--accent)] transition-colors">Draft an email</div>
                <div className="text-xs text-[var(--text-muted)]">A polite template declining an invitation.</div>
              </button>
              
              <button onClick={() => setInput("Explain quantum computing in simple terms.")} className="w-full text-left group">
                <div className="text-sm text-[var(--text-main)] font-medium group-hover:text-[var(--accent)] transition-colors">Explain a concept</div>
                <div className="text-xs text-[var(--text-muted)]">Quantum computing for beginners.</div>
              </button>
              
              <button onClick={() => setInput("Give me a 3-day itinerary for Tokyo.")} className="w-full text-left group">
                <div className="text-sm text-[var(--text-main)] font-medium group-hover:text-[var(--accent)] transition-colors">Plan a trip</div>
                <div className="text-xs text-[var(--text-muted)]">A 3-day itinerary for Tokyo.</div>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 pb-20">
            {messages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                onSuggestionClick={(s) => {
                  if (s === 'Retry') {
                    // find last user message and resend
                    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                    if (lastUserMsg) {
                      setInput(lastUserMsg.content);
                      setTimeout(handleSend, 0);
                    }
                  } else {
                    setInput(s);
                  }
                }} 
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="p-4 md:p-6 w-full max-w-4xl mx-auto bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)] to-transparent shrink-0 z-10 relative">
        <div className="relative bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl shadow-sm focus-within:border-[var(--secondary)] focus-within:ring-1 focus-within:ring-[var(--secondary)] transition-all">
          
          {selectedImage && (
            <div className="p-3 border-b border-[var(--border-color)] flex items-start">
              <div className="relative">
                <img src={selectedImage} alt="Selected" className="h-16 w-16 object-cover rounded-md border border-[var(--border-color)]" />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-[var(--bg-base)] rounded-full p-0.5 border border-[var(--border-color)] text-[var(--text-muted)] hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask KSAM anything..."
            className="w-full bg-transparent p-3 min-h-[44px] max-h-[200px] resize-none focus:outline-none text-[var(--text-main)] placeholder:text-[var(--text-muted)] text-sm custom-scrollbar"
            rows={1}
          />
          
          <div className="flex justify-between items-center px-2 pb-2">
            <div className="flex gap-1">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              <button onClick={() => fileInputRef.current?.click()} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <ImageIcon size={18} />
              </button>
              <button onClick={() => setShowCamera(true)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <Camera size={18} />
              </button>
              <VoiceInput onResult={(t) => setInput(prev => prev ? `${prev} ${t}` : t)} />
            </div>
            
            <button 
              onClick={handleSend}
              disabled={(!input.trim() && !selectedImage) || isComposing}
              className={`p-1.5 rounded-md transition-all ${
                (input.trim() || selectedImage) && !isComposing
                  ? 'btn-primary' 
                  : 'bg-[var(--border-color)] text-[var(--text-muted)] cursor-not-allowed opacity-50'
              }`}
            >
              <Send size={16} className={isComposing ? 'animate-pulse' : ''} />
            </button>
          </div>
        </div>
        <div className="text-center mt-2">
          <span className="text-[10px] text-[var(--text-muted)]">KSAM Assistant can make mistakes. Verify important info.</span>
        </div>
      </div>
    </div>
  );
}
