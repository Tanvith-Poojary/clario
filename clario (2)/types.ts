
export type MoodType = 'overwhelmed' | 'confused' | 'anxious' | 'clear';

export interface MoodEntry {
  date: string;
  mood: MoodType;
}

export interface User {
  id: string;
  username: string; // New: for login
  password: string; // New: simple local storage password
  onboardingCompleted: boolean;
  clarityScore: number;
  clarityHistory: { date: string; score: number }[];
  moodHistory?: MoodEntry[]; // New: track daily moods
  joinedDate: string;
  nickname?: string;
  bio?: string;
  avatarId?: string;
  communityAlias?: string;
  lastDailyActionDate?: string;
}

export enum MessageSender {
  User = 'user',
  AI = 'ai',
  System = 'system'
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: number;
}

export interface Journey {
  id: string;
  title: string;
  description: string;
  phases: JourneyPhase[];
  currentPhaseIndex: number;
  isStarted: boolean;
}

export interface JourneyPhase {
  title: string;
  content: string;
  action: string;
  isCompleted: boolean;
}

export interface CommunityPost {
  id: string;
  authorAlias: string;
  content: string;
  timestamp: number;
  reactions: string[]; // e.g., "I feel you", "Thank you"
  category: string;
}

export interface UnsentLetter {
  id: string;
  recipient: string; // "Parents", "Society", "Myself", etc.
  content: string;
  date: string;
}
