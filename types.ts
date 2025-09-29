// FIX: Add a triple-slash directive to include Vite's client types. This makes TypeScript aware of `import.meta.env` and resolves errors when accessing environment variables.
/// <reference types="vite/client" />

export interface Movement {
  id: number;
  name: string;
  type: string;
}

export interface PersonalRecord {
  id: number;
  user_id: string;
  movement_id: number;
  value: string;
  date: string;
  notes?: string;
  created_at: string;
  movements: {
    name: string;
    type: string;
  } | null;
}

export interface WOD {
  name: string;
  type: 'For Time' | 'AMRAP' | 'Other';
  description: string[];
  notes?: string;
}

export interface WODRecord {
    id: number;
    user_id: string;
    wod_name: string;
    score: string;
    date: string;
    notes?: string;
    created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
