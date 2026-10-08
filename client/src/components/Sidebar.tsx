import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import KSAMLogo from './KSAMLogo';
import { Plus, Search, Library, FolderKanban, CalendarClock, Puzzle, MoreHorizontal, Settings, Download, Keyboard, Info, Trash2, Pin, FolderInput, Edit2 } from 'lucide-react';
import { isToday, isYesterday, isThisWeek } from 'date-fns';

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  closeMobile: () => void;
  activeView: string;
  setActiveView: (view: any) => void;
  openSettings: () => void;
}

export default function Sidebar({ isOpen, setIsOpen, closeMobile, activeView, setActiveView, openSettings }: Props) {
  const { chats, activeChatId, setActiveChat, settings, updateChat, deleteChat, clearAllData } = useAppStore();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleNewChat = () => {
    setActiveChat(null);
    setActiveView('chat');
    if (window.innerWidth < 768) closeMobile();
  };

  const handleChatClick = (id: string) => {
    setActiveChat(id);
    setActiveView('chat');
    if (window.innerWidth < 768) closeMobile();
  };

  const filteredChats = chats.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
  
  const pinnedChats = filteredChats.filter(c => c.isPinned);
  const unpinnedChats = filteredChats.filter(c => !c.isPinned);
  
  const todayChats = unpinnedChats.filter(c => isToday(new Date(c.updatedAt)));
  const yesterdayChats = unpinnedChats.filter(c => isYesterday(new Date(c.updatedAt)));
  const thisWeekChats = unpinnedChats.filter(c => isThisWeek(new Date(c.updatedAt)) && !isToday(new Date(c.updatedAt)) && !isYesterday(new Date(c.updatedAt)));
  const olderChats = unpinnedChats.filter(c => !isToday(new Date(c.updatedAt)) && !isYesterday(new Date(c.updatedAt)) && !isThisWeek(new Date(c.updatedAt)));

  const SidebarItem = ({ icon: Icon, label, view, onClick }: any) => (
    <button
      onClick={onClick || (() => setActiveView(view))}
      className={`w-full flex items-center ${isOpen ? 'px-3' : 'justify-center'} py-2 rounded-lg transition-colors group relative ${
        activeView === view ? 'btn-primary' : 'text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--text-main)]'
      }`}
    >
      <Icon size={18} className="shrink-0" />
      {isOpen && <span className="ml-3 text-sm font-medium truncate">{label}</span>}
      {!isOpen && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </button>
  );

  const ChatGroup = ({ title, items }: { title: string, items: any[] }) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-4">
        {isOpen && <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-3">{title}</h4>}
        <div className="space-y-0.5">
          {items.map(chat => (
            <div key={chat.id} className="relative group">
              <button
                onClick={() => handleChatClick(chat.id)}
                className={`w-full flex items-center ${isOpen ? 'px-3' : 'justify-center'} py-2 rounded-lg transition-colors text-left ${
                  activeChatId === chat.id && activeView === 'chat' ? 'btn-primary' : 'text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--text-main)]'
                }`}
              >
                {!isOpen ? (
                  <div className="w-5 h-5 rounded bg-black/10 dark:bg-white/10 flex items-center justify-center text-xs font-medium uppercase shrink-0">
                    {chat.title.charAt(0)}
                  </div>
                ) : (
                  <span className="text-sm truncate pr-6">{chat.title}</span>
                )}
              </button>
              {isOpen && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-gradient-to-l from-[var(--bg-sidebar)] via-[var(--bg-sidebar)] pl-2">
                  <button onClick={(e) => { e.stopPropagation(); updateChat(chat.id, { isPinned: !chat.isPinned }); }} className="p-1 hover:text-[var(--accent)] text-[var(--text-muted)] transition-colors" title={chat.isPinned ? "Unpin" : "Pin"}>
                    <Pin size={14} className={chat.isPinned ? "fill-current text-[var(--accent)]" : ""} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }} className="p-1 hover:text-red-500 text-[var(--text-muted)] transition-colors" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`h-full bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex flex-col transition-all duration-300 ${isOpen ? 'w-72' : 'w-16'}`}>
      
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-[var(--border-color)] shrink-0 justify-between group cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center overflow-hidden pointer-events-none">
          <KSAMLogo className="w-8 h-8 shrink-0 group-hover:animate-logo-pulse transition-all duration-300" />
          {isOpen && <span className="ml-3 font-serif font-medium text-lg whitespace-nowrap text-gradient drop-shadow-sm">KSAM Assistant</span>}
        </div>
        <button 
          className="hidden md:flex p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-muted)] shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isOpen ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 flex flex-col custom-scrollbar">
        {/* Top Actions */}
        <div className="space-y-1 mb-6">
          <button
            onClick={handleNewChat}
            className={`w-full flex items-center ${isOpen ? 'px-3 justify-start' : 'justify-center'} py-2.5 rounded-lg btn-primary mb-2`}
          >
            <Plus size={18} className="shrink-0" />
            {isOpen && <span className="ml-3 text-sm font-medium">New chat</span>}
          </button>
          
          {isOpen ? (
            <div className="relative mb-2">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                <Search size={14} />
              </div>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search chats..."
                className="w-full bg-white/40 dark:bg-black/10 border border-[var(--border-color)] rounded-lg py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-muted)]"
              />
            </div>
          ) : (
            <SidebarItem icon={Search} label="Search" onClick={() => { setIsOpen(true); setTimeout(() => (document.querySelector('input[placeholder="Search chats..."]') as HTMLElement)?.focus(), 100); }} />
          )}

          <SidebarItem icon={Library} label="Library" view="library" />
          <SidebarItem icon={FolderKanban} label="Projects" view="projects" />
          <SidebarItem icon={CalendarClock} label="Scheduled" view="scheduled" />
          <SidebarItem icon={Puzzle} label="Plugins" view="plugins" />
          
          <div className="relative">
            <SidebarItem icon={MoreHorizontal} label="More" onClick={() => isOpen ? setShowMore(!showMore) : setIsOpen(true)} />
            {showMore && isOpen && (
              <div className="ml-8 mt-1 space-y-1 border-l border-[var(--border-color)] pl-2">
                <button onClick={openSettings} className="w-full flex items-center px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors"><Settings size={14} className="mr-2"/> Settings</button>
                <button className="w-full flex items-center px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors"><Download size={14} className="mr-2"/> Export data</button>
                <button className="w-full flex items-center px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors"><Keyboard size={14} className="mr-2"/> Shortcuts</button>
                <button className="w-full flex items-center px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors"><Info size={14} className="mr-2"/> About</button>
              </div>
            )}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 min-h-0">
          {search && filteredChats.length === 0 && isOpen && (
            <div className="px-3 text-sm text-[var(--text-muted)] py-4 text-center">No chats found.</div>
          )}
          <ChatGroup title="Pinned" items={pinnedChats} />
          <ChatGroup title="Today" items={todayChats} />
          <ChatGroup title="Yesterday" items={yesterdayChats} />
          <ChatGroup title="Previous 7 Days" items={thisWeekChats} />
          <ChatGroup title="Older" items={olderChats} />
        </div>
      </div>

      {/* User Profile */}
      <div className="relative p-2 border-t border-[var(--border-color)] shrink-0">
        <button 
          onClick={() => isOpen ? setShowProfile(!showProfile) : setIsOpen(true)}
          className={`w-full flex items-center ${isOpen ? 'px-2' : 'justify-center'} py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--secondary)] flex items-center justify-center text-white font-medium text-sm shrink-0">
            {settings.name ? settings.name.charAt(0).toUpperCase() : 'U'}
          </div>
          {isOpen && (
            <div className="ml-3 overflow-hidden flex-1">
              <div className="text-sm font-medium truncate text-[var(--text-main)]">{settings.name || 'User'}</div>
              <div className="text-xs text-[var(--text-muted)]">Free plan</div>
            </div>
          )}
        </button>

        {showProfile && isOpen && (
          <div className="absolute bottom-full left-2 right-2 mb-2 bg-[var(--bg-base)] border border-[var(--border-color)] rounded-lg shadow-lg p-1 animate-fade-in z-50">
            <button onClick={() => { openSettings(); setShowProfile(false); }} className="w-full text-left px-3 py-2 text-sm text-[var(--text-main)] hover:bg-[var(--bg-sidebar)] rounded-md transition-colors">Settings</button>
            <button onClick={() => { clearAllData(); setShowProfile(false); }} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors mt-1">Clear all data</button>
          </div>
        )}
      </div>
    </div>
  );
}
