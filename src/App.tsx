import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { User, Habit, Achievement } from './types/habit';
import {
  getStoredUser,
  saveStoredUser,
  getStoredHabits,
  saveStoredHabits,
  getStoredAchievements,
  evaluateAchievements,
  calculateStreaks,
  getLocalDateString
} from './utils/storage';
import { Onboarding } from './components/Onboarding';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { Analytics } from './components/Analytics';
import { Achievements } from './components/Achievements';
import { HabitModal } from './components/HabitModal';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'award';
  badge?: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  // Load Initial State
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      applyTheme(storedUser.theme);
      setHabits(getStoredHabits(storedUser.email));
      setAchievements(getStoredAchievements(storedUser.email));
    } else {
      // If no user, check OS preferred theme to align onboarding look
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(systemDark ? 'dark' : 'light');
    }
  }, []);

  // Sync theme changes to classList
  const applyTheme = (theme: 'light' | 'dark') => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const handleThemeToggle = () => {
    if (!user) return;
    const newTheme = user.theme === 'light' ? 'dark' : 'light';
    const updatedUser: User = { ...user, theme: newTheme };
    setUser(updatedUser);
    saveStoredUser(updatedUser);
    applyTheme(newTheme);
    showToast(`Switched to ${newTheme} mode!`, 'info');
  };

  // Custom Toast notification pusher
  const showToast = (message: string, type: 'success' | 'info' | 'award', badge?: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type, badge }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Onboarding Complete Handler
  const handleOnboardingComplete = (newUser: User) => {
    saveStoredUser(newUser);
    setUser(newUser);
    applyTheme(newUser.theme);
    
    // Seed default habits and empty achievements
    const seededHabits = getStoredHabits(newUser.email);
    const seededAchievements = getStoredAchievements(newUser.email);
    setHabits(seededHabits);
    setAchievements(seededAchievements);

    showToast(`Welcome aboard, ${newUser.name}! Ready to build your habit streak?`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('habit_tracker_user');
    setUser(null);
    setHabits([]);
    setAchievements([]);
    showToast('Logged out successfully.', 'info');
  };

  // Confetti Launcher
  const triggerConfetti = (doubleBurst = false) => {
    if (doubleBurst) {
      const duration = 2 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    } else {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981']
      });
    }
  };

  // Handle checking/unchecking habits today
  const handleToggleCompleteToday = (habitId: string) => {
    const todayStr = getLocalDateString();
    const updated = habits.map((h) => {
      if (h.id !== habitId) return h;

      const isCompleted = h.history[todayStr] === true;
      const nextHistory = { ...h.history, [todayStr]: !isCompleted };
      const { current, longest } = calculateStreaks(nextHistory);

      // Trigger Confetti and Toast on mark complete (from undone to done)
      if (!isCompleted) {
        triggerConfetti(false);
        showToast(`Streak advanced to ${current} days on "${h.name}"!`, 'success');
      } else {
        showToast(`Removed log for today on "${h.name}".`, 'info');
      }

      return {
        ...h,
        history: nextHistory,
        streakCurrent: current,
        streakLongest: longest
      };
    });

    setHabits(updated);
    if (user) saveStoredHabits(user.email, updated);
    checkAchievements(updated);
  };

  // Handle toggling custom calendar days
  const handleToggleDay = (habitId: string, dateStr: string) => {
    const updated = habits.map((h) => {
      if (h.id !== habitId) return h;

      const isCompleted = h.history[dateStr] === true;
      const nextHistory = { ...h.history, [dateStr]: !isCompleted };
      const { current, longest } = calculateStreaks(nextHistory);

      if (!isCompleted) {
        triggerConfetti(false);
        showToast(`Logged completion for ${dateStr} on "${h.name}"!`, 'success');
      } else {
        showToast(`Removed completion for ${dateStr} on "${h.name}".`, 'info');
      }

      return {
        ...h,
        history: nextHistory,
        streakCurrent: current,
        streakLongest: longest
      };
    });

    setHabits(updated);
    if (user) saveStoredHabits(user.email, updated);
    checkAchievements(updated);
  };

  // Check achievements and launch badge toast alert
  const checkAchievements = (currentHabits: Habit[]) => {
    if (!user) return;
    const { updatedAchievements, newlyUnlocked } = evaluateAchievements(currentHabits, achievements, user.email);
    if (newlyUnlocked.length > 0) {
      setAchievements(updatedAchievements);
      newlyUnlocked.forEach((badge) => {
        triggerConfetti(true); // Double blast for badges
        showToast(`UNLOCKED BADGE: ${badge.title}! ${badge.description}`, 'award', badge.badge);
      });
    }
  };

  // Save Habit (Add or Edit)
  const handleSaveHabit = (
    habitData: Omit<Habit, 'id' | 'createdAt' | 'streakCurrent' | 'streakLongest' | 'history'>
  ) => {
    let updated: Habit[];

    if (habitToEdit) {
      // Edit mode
      updated = habits.map((h) => {
        if (h.id !== habitToEdit.id) return h;

        // Recalculate streak in case goal values changed, keeping historical entries
        const { current, longest } = calculateStreaks(h.history);
        return {
          ...h,
          ...habitData,
          streakCurrent: current,
          streakLongest: longest
        };
      });
      showToast(`Habit "${habitData.name}" updated successfully!`, 'success');
    } else {
      // Create mode
      const newHabit: Habit = {
        ...habitData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        streakCurrent: 0,
        streakLongest: 0,
        history: {}
      };
      updated = [...habits, newHabit];
      showToast(`Habit "${habitData.name}" created!`, 'success');
    }

    setHabits(updated);
    if (user) saveStoredHabits(user.email, updated);
    setHabitToEdit(null);
    checkAchievements(updated);
  };

  const handleDeleteHabit = (habitId: string) => {
    const target = habits.find(h => h.id === habitId);
    if (!target) return;

    if (confirm(`Are you sure you want to delete the habit "${target.name}"? This removes all historical streak logs permanently.`)) {
      const updated = habits.filter((h) => h.id !== habitId);
      setHabits(updated);
      if (user) saveStoredHabits(user.email, updated);
      showToast(`Deleted habit "${target.name}".`, 'info');
    }
  };

  const handleOpenAddModal = () => {
    setHabitToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (habit: Habit) => {
    setHabitToEdit(habit);
    setIsModalOpen(true);
  };

  // If onboarding is not completed, show onboarding view
  if (!user || !user.onboardingCompleted) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Router>
      <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-500 overflow-x-hidden">
        {/* Dynamic Background Blur Balls */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-900/5 rounded-full filter blur-3xl pointer-events-none animate-ambient-1"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/5 dark:bg-pink-900/5 rounded-full filter blur-3xl pointer-events-none animate-ambient-2"></div>

        {/* Global Navigation Bar */}
        <Navbar user={user} onThemeToggle={handleThemeToggle} onLogout={handleLogout} />

        {/* Main Content Area */}
        <main className="flex-1 w-full relative z-10">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  user={user}
                  habits={habits}
                  onToggleCompleteToday={handleToggleCompleteToday}
                  onToggleDay={handleToggleDay}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteHabit}
                  onOpenAddModal={handleOpenAddModal}
                />
              }
            />
            <Route path="/analytics" element={<Analytics habits={habits} />} />
            <Route path="/achievements" element={<Achievements achievements={achievements} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Create/Edit Habit Modal Overlay */}
        <HabitModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setHabitToEdit(null);
          }}
          onSave={handleSaveHabit}
          habitToEdit={habitToEdit}
        />

        {/* Custom Premium Toast Notification Stack */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
          <AnimatePresence>
            {toasts.map((toast) => {
              // Styling helper based on toast type
              const borderTheme =
                toast.type === 'award'
                  ? 'border-yellow-400 bg-amber-500/10 dark:bg-amber-500/15 text-slate-800 dark:text-amber-300'
                  : toast.type === 'success'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-slate-800 dark:text-emerald-400'
                  : 'border-indigo-500/30 bg-indigo-500/10 text-slate-800 dark:text-indigo-400';

              return (
                <motion.div
                  key={toast.id}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  className={`p-4 rounded-2xl border backdrop-blur-md shadow-lg flex items-start space-x-3 pointer-events-auto ${borderTheme}`}
                >
                  <span className="text-2xl select-none">
                    {toast.type === 'award' ? toast.badge || '👑' : toast.type === 'success' ? '✅' : 'ℹ️'}
                  </span>
                  <div className="text-left text-xs font-bold leading-relaxed flex-1">
                    {toast.type === 'award' ? (
                      <span className="uppercase text-[9px] block text-amber-500 tracking-wider font-extrabold mb-0.5">
                        Badge Unlocked!
                      </span>
                    ) : null}
                    {toast.message}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </Router>
  );
}
