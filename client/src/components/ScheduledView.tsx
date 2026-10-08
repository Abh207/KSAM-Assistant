import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { CalendarClock, Plus, Trash2, Pause, Play } from 'lucide-react';

export default function ScheduledView() {
  const { schedules, addSchedule, updateSchedule, deleteSchedule } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');

  const handleCreate = () => {
    if (title.trim() && prompt.trim()) {
      addSchedule({
        id: crypto.randomUUID(),
        title: title.trim(),
        prompt: prompt.trim(),
        time: new Date(Date.now() + 60000), // 1 min from now for demo
        repeat: 'once',
        isActive: true
      });
      setIsCreating(false);
      setTitle('');
      setPrompt('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)]">
      <div className="h-12 border-b border-[var(--border-color)] flex items-center justify-between px-6 shrink-0">
        <h2 className="font-serif font-medium text-lg">Scheduled Prompts</h2>
        <button onClick={() => setIsCreating(true)} className="p-1.5 btn-primary rounded-md transition-colors text-sm font-medium flex items-center">
          <Plus size={16} className="mr-1" /> New
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        {isCreating && (
          <div className="mb-6 bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-color)] shadow-sm">
            <h3 className="text-sm font-medium mb-3">Schedule a prompt</h3>
            <input 
              type="text" 
              placeholder="Title (e.g., Daily Summary)" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full mb-3 bg-transparent border-b border-[var(--border-color)] pb-2 text-sm focus:outline-none focus:border-[var(--accent)]"
            />
            <textarea 
              placeholder="Prompt to run..." 
              value={prompt} 
              onChange={e => setPrompt(e.target.value)} 
              rows={2}
              className="w-full mb-4 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-lg p-3 text-sm focus:outline-none focus:border-[var(--accent)] resize-none"
            />
            <div className="text-xs text-[var(--text-muted)] mb-4 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-900/50">
              Note: Scheduled prompts run locally and only while KSAM is open in your browser.
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsCreating(false)} className="px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)]">Cancel</button>
              <button onClick={handleCreate} className="px-3 py-1.5 btn-primary rounded-md text-sm">Save</button>
            </div>
          </div>
        )}

        {schedules.length === 0 && !isCreating ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto pt-10">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-sidebar)] flex items-center justify-center mb-4">
              <CalendarClock size={32} className="text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nothing scheduled</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">Automate your routine by scheduling prompts to run automatically.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map(sch => (
              <div key={sch.id} className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-[var(--text-main)]">{sch.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Runs {sch.repeat} • Next: {sch.time.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateSchedule(sch.id, { isActive: !sch.isActive })}
                    className={`p-2 rounded-md transition-colors ${sch.isActive ? 'text-[var(--text-muted)] hover:bg-black/5 dark:hover:bg-white/5' : 'text-green-500 bg-green-50 dark:bg-green-900/20'}`}
                  >
                    {sch.isActive ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button onClick={() => deleteSchedule(sch.id)} className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
