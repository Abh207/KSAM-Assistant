import React from 'react';
import type { Message } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, RefreshCw, PencilLine, GitBranch, Star, Volume2 } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { format } from 'date-fns';
import KSAMLogo from './KSAMLogo';

interface Props {
  message: Message;
  onSuggestionClick: (suggestion: string) => void;
}

export default function MessageBubble({ message, onSuggestionClick }: Props) {
  const isUser = message.role === 'user';
  const { settings } = useAppStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-6 group">
        <div className="max-w-[85%]">
          <div className="flex items-center justify-end mb-1 space-x-2">
            <span className="text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
              {format(new Date(message.timestamp), 'h:mm a')}
            </span>
            <span className="text-xs font-medium text-[var(--text-muted)]">
              {settings.name || 'You'}
            </span>
          </div>
          <div className="bg-[var(--message-user-bg)] rounded-2xl rounded-tr-sm px-4 py-3 text-[var(--text-main)] text-[15px] leading-relaxed">
            {message.image && (
              <img src={message.image} alt="User upload" className="max-w-full h-auto rounded-lg mb-3 border border-[var(--border-color)]" />
            )}
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
          <div className="flex justify-end mt-1 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"><PencilLine size={14} /></button>
          </div>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="mb-8 group">
      <div className="flex items-center mb-2 space-x-2">
        <KSAMLogo className={`w-5 h-5 shrink-0 ${message.isStreaming ? 'animate-logo-pulse' : ''}`} />
        <span className="text-xs font-medium text-[var(--text-main)]">KSAM Assistant</span>
        <span className="text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
          {format(new Date(message.timestamp), 'h:mm a')}
        </span>
      </div>
      
      <div className={`pl-7 relative ${message.isStreaming ? 'ml-[9px] pl-4' : ''}`}>
        {message.isStreaming && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--brand-gradient)] opacity-70"></div>}
        <div className="text-[var(--text-main)] text-[15px] leading-relaxed markdown-body">
          {message.content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          ) : (
            <div className="flex space-x-1 py-2">
              <div className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-[var(--text-muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>

        {message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {message.suggestions.map((s, i) => (
              <button 
                key={i}
                onClick={() => onSuggestionClick(s)}
                className="relative p-[1px] rounded-full btn-primary hover:opacity-90 transition-opacity"
              >
                <div className="bg-[var(--bg-base)] px-3 py-1.5 rounded-full h-full w-full flex items-center justify-center hover:bg-transparent transition-colors">
                  <span className="text-xs font-medium text-[#CFFCEB] group-hover:text-white transition-colors">{s}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {!message.isStreaming && (
          <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity -ml-1">
            <button onClick={handleCopy} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors" title="Copy text"><Copy size={15} /></button>
            <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors" title="Regenerate"><RefreshCw size={15} /></button>
            <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors" title="Branch from here"><GitBranch size={15} /></button>
            <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors" title="Star to library"><Star size={15} /></button>
            <button className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors" title="Read aloud"><Volume2 size={15} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
