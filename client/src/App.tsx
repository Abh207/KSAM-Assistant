import React, { useEffect, useState } from 'react';
import { useAppStore } from './lib/store';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import CommandPalette from './components/CommandPalette';
import SettingsDialog from './components/SettingsDialog';
import LibraryView from './components/LibraryView';
import ProjectsView from './components/ProjectsView';
import ScheduledView from './components/ScheduledView';
import PluginsView from './components/PluginsView';
import IntroSplash from './components/IntroSplash';

function App() {
  const { settings, activeChatId, chats } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'library' | 'projects' | 'scheduled' | 'plugins'>('chat');
  const [showSettings, setShowSettings] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [userNamePrompt, setUserNamePrompt] = useState(!settings.name);
  const [showIntro, setShowIntro] = useState(true);

  // Handle theme
  useEffect(() => {
    const root = document.documentElement;
    const isDark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Handle Ctrl+B and Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setShowPalette(true);
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'O') {
        e.preventDefault();
        useAppStore.getState().setActiveChat(null);
        setActiveView('chat');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-[var(--bg-base)] text-[var(--text-main)] font-sans antialiased selection:bg-[var(--accent)] selection:text-white">
      
      {/* Animated Background */}
      <div className="bubble-bg">
        <div className="aurora"></div>
      </div>
      
      {showIntro && <IntroSplash onComplete={() => setShowIntro(false)} />}
      
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed md:static inset-y-0 left-0 z-50 transform ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-all duration-300 ease-in-out`}>
        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen} 
          closeMobile={() => setMobileSidebarOpen(false)}
          activeView={activeView}
          setActiveView={setActiveView}
          openSettings={() => setShowSettings(true)}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen transition-all duration-300 relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 border-b border-[var(--border-color)]">
          <button onClick={() => setMobileSidebarOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-[var(--border-color)] transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <span className="font-serif font-medium ml-2">KSAM Assistant</span>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeView === 'chat' && <ChatView />}
          {activeView === 'library' && <LibraryView />}
          {activeView === 'projects' && <ProjectsView />}
          {activeView === 'scheduled' && <ScheduledView />}
          {activeView === 'plugins' && <PluginsView />}
        </div>
      </main>

      {/* Overlays */}
      {showPalette && <CommandPalette onClose={() => setShowPalette(false)} setView={setActiveView} />}
      {showSettings && <SettingsDialog onClose={() => setShowSettings(false)} />}
      
      {/* Onboarding Dialog */}
      {userNamePrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--bg-base)] p-8 rounded-xl shadow-2xl border border-[var(--border-color)] w-full max-w-sm animate-fade-in">
            <h2 className="text-2xl font-serif mb-2">Welcome to KSAM</h2>
            <p className="text-[var(--text-muted)] mb-6">How should I call you?</p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const name = fd.get('name') as string;
              if (name.trim()) {
                useAppStore.getState().updateSettings({ name: name.trim() });
                setUserNamePrompt(false);
              }
            }}>
              <input 
                name="name"
                type="text" 
                autoFocus
                className="w-full bg-transparent border-b border-[var(--border-color)] pb-2 text-lg focus:outline-none focus:border-[var(--accent)] transition-colors mb-6"
                placeholder="Your name..."
              />
              <div className="flex justify-end">
                <button type="submit" className="px-6 py-2 btn-primary rounded-lg transition-colors">
                  Start
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
