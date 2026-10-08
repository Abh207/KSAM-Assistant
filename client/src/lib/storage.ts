import type { Chat, Project, ScheduledPrompt, Plugin, UserSettings } from '../types';

const STORAGE_KEY = 'ksam_data_v1';

interface AppData {
  chats: Chat[];
  projects: Project[];
  schedules: ScheduledPrompt[];
  plugins: Plugin[];
  settings: UserSettings;
}

const defaultData: AppData = {
  chats: [],
  projects: [],
  schedules: [],
  plugins: [
    { id: 'photo-analyzer', name: 'Photo Analyzer', description: 'Identifies objects and suggests next steps', instructions: 'Analyze the photo carefully. Tell me what you see, give ideas, and suggest next steps.', isActive: false },
    { id: 'translator', name: 'Translator', description: 'Translates text fluently', instructions: 'You are an expert translator. Translate the text provided naturally and accurately.', isActive: false },
    { id: 'recipe-maker', name: 'Recipe Maker', description: 'Creates recipes from ingredients', instructions: 'Create a delicious recipe using the ingredients I provide or show in the photo.', isActive: false },
    { id: 'study-buddy', name: 'Study Buddy', description: 'Helps explain concepts simply', instructions: 'Explain concepts simply like I am a beginner. Use analogies.', isActive: false },
    { id: 'code-helper', name: 'Code Helper', description: 'Helps debug and write code', instructions: 'You are an expert programmer. Provide clean, efficient code and explain your logic.', isActive: false },
    { id: 'travel-planner', name: 'Travel Planner', description: 'Plans trips and itineraries', instructions: 'You are an expert travel planner. Create an exciting and practical itinerary.', isActive: false },
    { id: 'outfit-advisor', name: 'Outfit Advisor', description: 'Suggests outfits for occasions', instructions: 'Act as a fashion advisor. Suggest outfits based on the occasion and items I mention.', isActive: false },
  ],
  settings: {
    name: '',
    theme: 'system',
    responseStyle: 'balanced',
    readAloud: false,
    textSize: 'medium',
  }
};

export const storage = {
  load: (): AppData => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return defaultData;
      const parsed = JSON.parse(data);
      // Revive dates
      if (parsed.chats) {
        parsed.chats = parsed.chats.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          updatedAt: new Date(c.updatedAt),
          messages: c.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
      }
      if (parsed.schedules) {
        parsed.schedules = parsed.schedules.map((s: any) => ({
          ...s,
          time: new Date(s.time)
        }));
      }
      return { ...defaultData, ...parsed };
    } catch (e) {
      console.error('Failed to load storage, returning default.', e);
      return defaultData;
    }
  },
  save: (data: AppData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save storage.', e);
    }
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
