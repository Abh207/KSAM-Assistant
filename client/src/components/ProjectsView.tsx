import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { Plus, Settings, Play, Trash2 } from 'lucide-react';

export default function ProjectsView() {
  const { projects, addProject, deleteProject } = useAppStore();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');

  const handleCreate = () => {
    if (name.trim()) {
      addProject({
        id: crypto.randomUUID(),
        name: name.trim(),
        color: '#D9622B', // default accent
        instructions: instructions.trim()
      });
      setIsCreating(false);
      setName('');
      setInstructions('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)]">
      <div className="h-12 border-b border-[var(--border-color)] flex items-center justify-between px-6 shrink-0">
        <h2 className="font-serif font-medium text-lg">Projects</h2>
        <button onClick={() => setIsCreating(true)} className="p-1.5 btn-primary rounded-md transition-colors text-sm font-medium flex items-center">
          <Plus size={16} className="mr-1" /> New Project
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        {isCreating && (
          <div className="mb-6 bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-color)] shadow-sm">
            <h3 className="text-sm font-medium mb-3">Create New Project</h3>
            <input 
              type="text" 
              placeholder="Project Name (e.g., German Tutor)" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full mb-3 bg-transparent border-b border-[var(--border-color)] pb-2 text-sm focus:outline-none focus:border-[var(--accent)]"
            />
            <textarea 
              placeholder="Custom System Instructions (e.g., You are a strict German tutor. Correct my grammar.)" 
              value={instructions} 
              onChange={e => setInstructions(e.target.value)} 
              rows={3}
              className="w-full mb-4 bg-[var(--bg-sidebar)] border border-[var(--border-color)] rounded-lg p-3 text-sm focus:outline-none focus:border-[var(--accent)] resize-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsCreating(false)} className="px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)]">Cancel</button>
              <button onClick={handleCreate} className="px-3 py-1.5 btn-primary rounded-md text-sm">Save</button>
            </div>
          </div>
        )}

        {projects.length === 0 && !isCreating ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto pt-10">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-sidebar)] flex items-center justify-center mb-4">
              <FolderKanban size={32} className="text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6">Create dedicated workspaces with custom AI instructions for specific tasks.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(proj => (
              <div key={proj.id} className="p-5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-[var(--text-main)]">{proj.name}</h3>
                  <button onClick={() => deleteProject(proj.id)} className="text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-4">{proj.instructions || 'No custom instructions.'}</p>
                <button 
                  className="w-full py-2 bg-[var(--bg-sidebar)] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-sm font-medium transition-colors border border-[var(--border-color)]"
                  onClick={() => {
                    // Logic to start chat in this project
                  }}
                >
                  New chat in project
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Dummy import to satisfy compiler since I used the icon
import { FolderKanban } from 'lucide-react';
