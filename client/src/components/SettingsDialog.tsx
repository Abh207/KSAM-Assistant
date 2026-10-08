import React from 'react';
import { useAppStore } from '../lib/store';
import { X } from 'lucide-react';

export default function SettingsDialog({ onClose }: { onClose: () => void }) {
  const { settings, updateSettings } = useAppStore();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-base)] w-full max-w-md rounded-xl shadow-2xl border border-[var(--border-color)] overflow-hidden animate-fade-in flex flex-col max-h-full">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-serif font-medium">Settings</h2>
          <button onClick={onClose} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)]">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-main)] mb-1">Your Name</label>
            <input 
              type="text" 
              value={settings.name}
              onChange={e => updateSettings({ name: e.target.value })}
              className="w-full bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)] text-[var(--text-main)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-main)] mb-1">Theme</label>
            <select 
              value={settings.theme}
              onChange={e => updateSettings({ theme: e.target.value as any })}
              className="w-full bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)] text-[var(--text-main)]"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-main)] mb-1">Response Style</label>
            <select 
              value={settings.responseStyle}
              onChange={e => updateSettings({ responseStyle: e.target.value as any })}
              className="w-full bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)] text-[var(--text-main)]"
            >
              <option value="concise">Concise</option>
              <option value="balanced">Balanced</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-sm font-medium text-[var(--text-main)]">Read replies aloud</div>
              <div className="text-xs text-[var(--text-muted)]">Automatically speak KSAM's responses</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={settings.readAloud} onChange={e => updateSettings({ readAloud: e.target.checked })} />
              <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent)]"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
