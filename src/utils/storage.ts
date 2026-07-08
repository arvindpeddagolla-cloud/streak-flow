import type { Habit, User, Achievement } from '../types/habit';

// Helper to get formatted date string (YYYY-MM-DD) in local time
export const getLocalDateString = (date: Date = new Date()): string => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
};

// Generate list of date strings for the last N days
export const getLastNDays = (n: number): string[] => {
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(getLocalDateString(d));
  }
  return dates;
};

// Calculate streak details for a single habit history
export const calculateStreaks = (history: Record<string, boolean>): { current: number; longest: number } => {
  const completedDates = Object.entries(history)
    .filter(([_, completed]) => completed)
    .map(([dateStr]) => dateStr)
    .sort();

  if (completedDates.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Find longest streak
  let longest = 0;
  let currentRun = 0;
  let prevTime: number | null = null;

  const dateObjects = completedDates.map(d => new Date(d + 'T00:00:00'));

  for (let i = 0; i < dateObjects.length; i++) {
    const currTime = dateObjects[i].getTime();
    if (prevTime === null) {
      currentRun = 1;
    } else {
      const diffDays = Math.round((currTime - prevTime) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentRun += 1;
      } else if (diffDays > 1) {
        longest = Math.max(longest, currentRun);
        currentRun = 1;
      }
    }
    prevTime = currTime;
  }
  longest = Math.max(longest, currentRun);

  // Find current streak
  let current = 0;
  const todayStr = getLocalDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  const hasCompletedToday = history[todayStr] === true;
  const hasCompletedYesterday = history[yesterdayStr] === true;

  if (hasCompletedToday || hasCompletedYesterday) {
    // Start counting backwards from the most recent completed day (today or yesterday)
    let checkDate = hasCompletedToday ? new Date() : yesterday;
    let checkStr = getLocalDateString(checkDate);

    while (history[checkStr] === true) {
      current++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkStr = getLocalDateString(checkDate);
    }
  }

  return { current, longest };
};

// Seed habits (empty by default to remove demo values)
const DEFAULT_HABITS = (): Habit[] => {
  return [];
};

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_habit', title: 'First Habit Completed', description: 'Log your first habit completion', badge: '🏆', unlockedAt: null },
  { id: 'streak_7', title: '7-Day Streak', description: 'Achieve a 7-day streak on any habit', badge: '🔥', unlockedAt: null },
  { id: 'streak_30', title: '30-Day Streak', description: 'Achieve a 30-day streak on any habit', badge: '💎', unlockedAt: null },
  { id: 'streak_50', title: '50-Day Streak', description: 'Achieve a 50-day streak on any habit', badge: '🚀', unlockedAt: null },
  { id: 'streak_100', title: '100-Day Streak', description: 'Achieve a 100-day streak on any habit', badge: '⭐', unlockedAt: null },
  { id: 'consistency_master', title: 'Consistency Master', description: 'Log 100 total habit completions', badge: '👑', unlockedAt: null }
];

const STORAGE_KEYS = {
  USER: 'streakflow_v3_user',
  HABITS_PREFIX: 'streakflow_v3_habits_',
  ACHIEVEMENTS_PREFIX: 'streakflow_v3_achievements_',
  USERS_DB: 'streakflow_v3_users_db'
};

export const getStoredUsersDB = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS_DB);
  return data ? JSON.parse(data) : [];
};

export const saveStoredUsersDB = (users: User[]): void => {
  localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
};

export const getStoredUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.USER);
  return data ? JSON.parse(data) : null;
};

export const saveStoredUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const getStoredHabits = (email: string): Habit[] => {
  const key = `${STORAGE_KEYS.HABITS_PREFIX}${email}`;
  const data = localStorage.getItem(key);
  if (data) {
    return JSON.parse(data);
  }
  const defaults = DEFAULT_HABITS();
  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
};

export const saveStoredHabits = (email: string, habits: Habit[]): void => {
  const key = `${STORAGE_KEYS.HABITS_PREFIX}${email}`;
  localStorage.setItem(key, JSON.stringify(habits));
};

export const getStoredAchievements = (email: string): Achievement[] => {
  const key = `${STORAGE_KEYS.ACHIEVEMENTS_PREFIX}${email}`;
  const data = localStorage.getItem(key);
  if (data) {
    return JSON.parse(data);
  }
  localStorage.setItem(key, JSON.stringify(DEFAULT_ACHIEVEMENTS));
  return DEFAULT_ACHIEVEMENTS;
};

export const saveStoredAchievements = (email: string, achievements: Achievement[]): void => {
  const key = `${STORAGE_KEYS.ACHIEVEMENTS_PREFIX}${email}`;
  localStorage.setItem(key, JSON.stringify(achievements));
};

// Check and trigger new achievements based on current habit history
export const evaluateAchievements = (
  habits: Habit[],
  currentAchievements: Achievement[],
  email: string
): { updatedAchievements: Achievement[]; newlyUnlocked: Achievement[] } => {
  const newlyUnlocked: Achievement[] = [];
  const totalCompletions = habits.reduce((sum, h) => {
    return sum + Object.values(h.history).filter(v => v).length;
  }, 0);

  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streakCurrent), 0);

  const updatedAchievements = currentAchievements.map(ach => {
    // If already unlocked, keep as is
    if (ach.unlockedAt) return ach;

    let shouldUnlock = false;

    switch (ach.id) {
      case 'first_habit':
        shouldUnlock = totalCompletions >= 1;
        break;
      case 'streak_7':
        shouldUnlock = maxStreak >= 7;
        break;
      case 'streak_30':
        shouldUnlock = maxStreak >= 30;
        break;
      case 'streak_50':
        shouldUnlock = maxStreak >= 50;
        break;
      case 'streak_100':
        shouldUnlock = maxStreak >= 100;
        break;
      case 'consistency_master':
        shouldUnlock = totalCompletions >= 100;
        break;
      default:
        break;
    }

    if (shouldUnlock) {
      const unlocked = { ...ach, unlockedAt: new Date().toISOString() };
      newlyUnlocked.push(unlocked);
      return unlocked;
    }

    return ach;
  });

  if (newlyUnlocked.length > 0) {
    saveStoredAchievements(email, updatedAchievements);
  }

  return { updatedAchievements, newlyUnlocked };
};

export const registerUser = (name: string, email: string, password: string): { success: boolean; error?: string; user?: User } => {
  const users = getStoredUsersDB();
  const lowerEmail = email.toLowerCase().trim();
  
  if (users.some(u => u.email.toLowerCase() === lowerEmail)) {
    return { success: false, error: 'Email already registered.' };
  }
  
  const newUser: User = {
    name: name.trim(),
    email: lowerEmail,
    password,
    onboardingCompleted: true,
    theme: 'dark',
    joinedAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveStoredUsersDB(users);
  return { success: true, user: newUser };
};

export const loginUser = (email: string, password: string): { success: boolean; error?: string; user?: User } => {
  const users = getStoredUsersDB();
  const lowerEmail = email.toLowerCase().trim();
  
  const user = users.find(u => u.email.toLowerCase() === lowerEmail);
  if (!user) {
    return { success: false, error: 'Email address not found. Please register first.' };
  }
  
  if (user.password !== password) {
    return { success: false, error: 'Invalid password. Please try again.' };
  }
  
  return { success: true, user };
};

// Quote database
export const MOTIVATIONAL_QUOTES = [
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "It is easier to prevent bad habits than to break them.", author: "Benjamin Franklin" },
  { text: "Your habits will determine your future.", author: "Jack Canfield" },
  { text: "Consistency is the compound interest of self-improvement.", author: "James Clear" },
  { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "Focus on the process, not the outcome.", author: "James Clear" },
  { text: "Habits are the invisible architecture of daily life.", author: "Gretchen Rubin" }
];

// Daily Challenges seed
export const DAILY_CHALLENGES = [
  { id: '1', title: 'Double Focus', description: 'Log completions for 2 different habits today!', targetCategory: 'Any', points: 15 },
  { id: '2', title: 'Early Bird', description: 'Mark at least one habit as completed before noon.', targetCategory: 'Any', points: 10 },
  { id: '3', title: 'Mind over Matter', description: 'Complete a Meditation or Study habit today.', targetCategory: 'Mind', points: 20 },
  { id: '4', title: 'Stay Hydrated', description: 'Complete your Water habit or drink a full glass of water.', targetCategory: 'Water', points: 10 },
  { id: '5', title: 'Sweat Session', description: 'Complete your Exercise or Health habit today.', targetCategory: 'Exercise', points: 20 }
];

export const getDailyChallenge = (): typeof DAILY_CHALLENGES[0] => {
  // Use day of the month to cycle through challenges
  const day = new Date().getDate();
  return DAILY_CHALLENGES[day % DAILY_CHALLENGES.length];
};

export const getQuoteOfTheDay = (): typeof MOTIVATIONAL_QUOTES[0] => {
  const day = new Date().getDate();
  return MOTIVATIONAL_QUOTES[day % MOTIVATIONAL_QUOTES.length];
};
