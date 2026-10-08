import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../lib/store';
import { Search, FolderKanban, MessageSquare, Plus, Palette, Library } from 'lucide-react';

export default function CommandPalette({ onClose, setView }: { onClose: () => void, setView: (v: any) => void }) {
  const { chats, projects, setActiveChat, updateSettings, settings } = useAppStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const allItems = [
    { type: 'action', title: 'New Chat', icon: Plus, onSelect: () => { setActiveChat(null); setView('chat'); onClose(); } },
    { type: 'nav', title: 'Go to Library', icon: Library, onSelect: () => { setView('library'); onClose(); } },
    { type: 'nav', title: 'Go to Projects', icon: FolderKanban, onSelect: () => { setView('projects'); onClose(); } },
    { type: 'action', title: `Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} Theme`, icon: Palette, onSelect: () => { updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' }); onClose(); } },
    ...chats.map(c => ({ type: 'chat', title: c.title, icon: MessageSquare, onSelect: () => { setActiveChat(c.id); setView('chat'); onClose(); } })),
    ...projects.map(p => ({ type: 'project', title: p.name, icon: FolderKanban, onSelect: () => { setView('projects'); onClose(); } }))
  ];

  const filtered = query ? allItems.filter(item => item.title.toLowerCase().includes(query.toLowerCase())) : allItems.slice(0, 8);

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-xl bg-[var(--bg-surface)] rounded-xl shadow-2xl border border-[var(--border-color)] overflow-hidden animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-[var(--border-color)]">
          <Search size={18} className="text-[var(--text-muted)] mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-[var(--text-main)] focus:outline-none text-base"
          />
          <div className="text-[10px] border border-[var(--border-color)] px-1.5 py-0.5 rounded text-[var(--text-muted)] bg-[var(--bg-sidebar)]">ESC</div>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-[var(--text-muted)] text-sm">
              No results found for "{query}"
            </div>
          ) : (
            filtered.map((item, i) => (
              <button
                key={i}
                onClick={item.onSelect}
                className="w-full flex items-center px-4 py-3 rounded-lg hover:bg-[var(--accent)] hover:text-[#022020] transition-colors group text-left"
              >
                <item.icon size={16} className="text-[var(--text-muted)] group-hover:text-[#022020] mr-3 shrink-0" />
                <span className="text-sm font-medium text-[var(--text-main)] group-hover:text-[#022020] truncate">
                  {item.title}
                </span>
                <span className="ml-auto text-[10px] text-[var(--text-muted)] group-hover:text-[#022020]/70 uppercase">
                  {item.type}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
