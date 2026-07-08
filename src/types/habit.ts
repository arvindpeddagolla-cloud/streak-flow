export interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  color: string; // Tailwind color class suffix, e.g. "indigo", "violet", "rose", "emerald", "amber"
  dailyGoal: number; // e.g., 1 (meaning 1 time per day)
  createdAt: string; // ISO date string
  streakCurrent: number;
  streakLongest: number;
  history: Record<string, boolean>; // key: "YYYY-MM-DD", value: completed (true) or missed (false)
}

export interface User {
  name: string;
  email: string;
  password?: string; // Optional if we strip it on session state, but keep it in database
  onboardingCompleted: boolean;
  theme: 'light' | 'dark';
  joinedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badge: string; // emoji character
  unlockedAt: string | null; // ISO date string or null if locked
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  targetCategory: string;
  points: number;
}
