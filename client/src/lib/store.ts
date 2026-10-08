import { create } from 'zustand';
import { storage } from './storage';
import type { Chat, Project, ScheduledPrompt, Plugin, UserSettings, Message } from '../types';

interface AppState {
  chats: Chat[];
  projects: Project[];
  schedules: ScheduledPrompt[];
  plugins: Plugin[];
  settings: UserSettings;
  
  activeChatId: string | null;
  setActiveChat: (id: string | null) => void;
  
  addChat: (chat: Chat) => void;
  updateChat: (id: string, updates: Partial<Chat>) => void;
  deleteChat: (id: string) => void;
  
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  addSchedule: (schedule: ScheduledPrompt) => void;
  updateSchedule: (id: string, updates: Partial<ScheduledPrompt>) => void;
  deleteSchedule: (id: string) => void;
  
  updatePlugin: (id: string, updates: Partial<Plugin>) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  
  clearAllData: () => void;
}

const initialData = storage.load();

export const useAppStore = create<AppState>((set, get) => ({
  ...initialData,
  activeChatId: initialData.chats.length > 0 ? initialData.chats[0].id : null,
  
  setActiveChat: (id) => set({ activeChatId: id }),
  
  addChat: (chat) => set((state) => {
    const newChats = [chat, ...state.chats];
    storage.save({ ...state, chats: newChats });
    return { chats: newChats, activeChatId: chat.id };
  }),
  
  updateChat: (id, updates) => set((state) => {
    const newChats = state.chats.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c);
    storage.save({ ...state, chats: newChats });
    return { chats: newChats };
  }),
  
  deleteChat: (id) => set((state) => {
    const newChats = state.chats.filter(c => c.id !== id);
    storage.save({ ...state, chats: newChats });
    return { chats: newChats, activeChatId: state.activeChatId === id ? (newChats[0]?.id || null) : state.activeChatId };
  }),
  
  addMessage: (chatId, message) => set((state) => {
    const newChats = state.chats.map(c => {
      if (c.id === chatId) {
        return { ...c, messages: [...c.messages, message], updatedAt: new Date() };
      }
      return c;
    });
    storage.save({ ...state, chats: newChats });
    return { chats: newChats };
  }),
  
  updateMessage: (chatId, messageId, updates) => set((state) => {
    const newChats = state.chats.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: c.messages.map(m => m.id === messageId ? { ...m, ...updates } : m)
        };
      }
      return c;
    });
    storage.save({ ...state, chats: newChats });
    return { chats: newChats };
  }),
  
  addProject: (project) => set((state) => {
    const newProjects = [...state.projects, project];
    storage.save({ ...state, projects: newProjects });
    return { projects: newProjects };
  }),
  
  updateProject: (id, updates) => set((state) => {
    const newProjects = state.projects.map(p => p.id === id ? { ...p, ...updates } : p);
    storage.save({ ...state, projects: newProjects });
    return { projects: newProjects };
  }),
  
  deleteProject: (id) => set((state) => {
    const newProjects = state.projects.filter(p => p.id !== id);
    storage.save({ ...state, projects: newProjects });
    return { projects: newProjects };
  }),
  
  addSchedule: (schedule) => set((state) => {
    const newSchedules = [...state.schedules, schedule];
    storage.save({ ...state, schedules: newSchedules });
    return { schedules: newSchedules };
  }),
  
  updateSchedule: (id, updates) => set((state) => {
    const newSchedules = state.schedules.map(s => s.id === id ? { ...s, ...updates } : s);
    storage.save({ ...state, schedules: newSchedules });
    return { schedules: newSchedules };
  }),
  
  deleteSchedule: (id) => set((state) => {
    const newSchedules = state.schedules.filter(s => s.id !== id);
    storage.save({ ...state, schedules: newSchedules });
    return { schedules: newSchedules };
  }),
  
  updatePlugin: (id, updates) => set((state) => {
    const newPlugins = state.plugins.map(p => p.id === id ? { ...p, ...updates } : p);
    storage.save({ ...state, plugins: newPlugins });
    return { plugins: newPlugins };
  }),
  
  updateSettings: (updates) => set((state) => {
    const newSettings = { ...state.settings, ...updates };
    storage.save({ ...state, settings: newSettings });
    return { settings: newSettings };
  }),
  
  clearAllData: () => {
    storage.clear();
    const fresh = storage.load();
    set({ ...fresh, activeChatId: null });
  }
}));
