export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  image?: string;
  isStreaming?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
  createdAt: Date;
  projectId?: string;
  pluginId?: string;
  isPinned?: boolean;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  instructions: string;
}

export interface ScheduledPrompt {
  id: string;
  title: string;
  prompt: string;
  time: Date;
  repeat: 'once' | 'daily' | 'weekly';
  isActive: boolean;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  instructions: string;
  isActive: boolean;
}

export interface UserSettings {
  name: string;
  theme: 'light' | 'dark' | 'system';
  responseStyle: 'concise' | 'balanced' | 'detailed';
  readAloud: boolean;
  textSize: 'small' | 'medium' | 'large';
}
