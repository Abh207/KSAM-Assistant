import React from 'react';
import { useAppStore } from '../lib/store';

export default function LibraryView() {
  const { chats } = useAppStore();
  
  // Extract all images from chats
  const images = chats.flatMap(chat => 
    chat.messages
      .filter(m => m.image)
      .map(m => ({ id: m.id, url: m.image!, chatId: chat.id, date: m.timestamp }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex flex-col h-full bg-[var(--bg-base)]">
      <div className="h-12 border-b border-[var(--border-color)] flex items-center px-6 shrink-0">
        <h2 className="font-serif font-medium text-lg">Library</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        {images.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-sidebar)] flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Your library is empty</h3>
            <p className="text-sm text-[var(--text-muted)]">Photos you upload or capture in chats will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map(img => (
              <div key={img.id} className="aspect-square relative group rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-sidebar)]">
                <img src={img.url} alt="Saved in chat" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => useAppStore.getState().setActiveChat(img.chatId)} className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-lg text-sm font-medium transition-colors">
                    View in Chat
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
