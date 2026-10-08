import React from 'react';
import { useAppStore } from '../lib/store';
import { Puzzle } from 'lucide-react';

export default function PluginsView() {
  const { plugins, updatePlugin } = useAppStore();

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)]">
      <div className="h-12 border-b border-[var(--border-color)] flex items-center px-6 shrink-0">
        <h2 className="font-serif font-medium text-lg">Plugins & Skills</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plugins.map(plugin => (
            <div key={plugin.id} className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm flex items-start justify-between">
              <div className="flex-1 pr-4">
                <h3 className="font-medium text-[var(--text-main)] mb-1">{plugin.name}</h3>
                <p className="text-sm text-[var(--text-muted)]">{plugin.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={plugin.isActive} 
                  onChange={e => updatePlugin(plugin.id, { isActive: e.target.checked })} 
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent)]"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
