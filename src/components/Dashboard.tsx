import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiSearch,
  FiClock,
  FiCalendar,
  FiAward,
  FiCheckCircle,
  FiZap
} from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import type { Habit, User } from '../types/habit';
import { HabitCard } from './HabitCard';
import {
  getQuoteOfTheDay,
  getDailyChallenge,
  getLocalDateString
} from '../utils/storage';

interface DashboardProps {
  user: User;
  habits: Habit[];
  onToggleCompleteToday: (habitId: string) => void;
  onToggleDay: (habitId: string, dateStr: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
  onOpenAddModal: () => void;
}

const CATEGORIES = ['All', 'Study', 'Coding', 'Reading', 'Exercise', 'Meditation', 'Water', 'Health', 'Productivity', 'Personal'];

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  habits,
  onToggleCompleteToday,
  onToggleDay,
  onEdit,
  onDelete,
  onOpenAddModal
}) => {
  const [time, setTime] = useState(new Date());
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const todayStr = getLocalDateString();

  // 1. Live Digital Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Personal Greeting helper
  const getGreeting = () => {
    const hrs = time.getHours();
    if (hrs < 12) return `🌅 Good Morning, ${user.name}! Ready to build today's streak?`;
    if (hrs < 17) return `☀️ Good Afternoon, ${user.name}! Keep your momentum going.`;
    if (hrs < 21) return `🌇 Good Evening, ${user.name}! You're doing amazing today.`;
    return `🌙 Good Night, ${user.name}! Great work staying consistent.`;
  };

  const formattedDate = time.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = time.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Quotes and Challenges
  const quote = getQuoteOfTheDay();
  const challenge = getDailyChallenge();

  // 3. Stats Calculations
  const activeHabitsCount = habits.length;
  const completedTodayCount = habits.filter(h => h.history[todayStr] === true).length;
  
  const totalCompletedDays = habits.reduce((sum, h) => {
    return sum + Object.values(h.history).filter(v => v).length;
  }, 0);

  const totalPossibleDays = habits.reduce((sum, h) => {
    return sum + Object.keys(h.history).length;
  }, 0);

  const completionRate = totalPossibleDays > 0
    ? Math.round((totalCompletedDays / totalPossibleDays) * 100)
    : 0;

  const maxCurrentStreak = habits.reduce((max, h) => Math.max(max, h.streakCurrent), 0);
  const maxLongestStreak = habits.reduce((max, h) => Math.max(max, h.streakLongest), 0);

  // 4. Filtering Logic
  const filteredHabits = habits.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase()) || 
                          (h.description && h.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || h.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8">
      {/* Greeting & Quote Header Block */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-6 md:p-8 border border-white/20 dark:border-slate-800/80 shadow-md relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 z-10 relative">
          <div className="text-left space-y-2 max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-slate-800 dark:text-white leading-tight">
              {getGreeting()}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 italic text-sm md:text-base leading-relaxed pl-1">
              "{quote.text}" — <span className="font-bold text-xs uppercase tracking-wider">{quote.author}</span>
            </p>
          </div>

          {/* Clock & Calendar Block */}
          <div className="flex flex-col items-start md:items-end text-left md:text-right shrink-0 bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 px-4 py-2.5 rounded-2xl shadow-sm">
            <div className="flex items-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
              <FiClock className="mr-1.5 w-3.5 h-3.5" />
              Live Clock
            </div>
            <div className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-display">
              {formattedTime}
            </div>
            <div className="text-[11px] font-bold text-slate-500 mt-0.5 flex items-center">
              <FiCalendar className="mr-1 w-3 h-3" />
              {formattedDate}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Grid: Left stats panel & Right challenge cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics Board */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {/* Streak Active */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/80 text-left flex flex-col justify-between h-[115px]">
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Active Streak</span>
              <FaFire className="text-orange-500 w-4 h-4 animate-pulse" />
            </div>
            <span className="text-3xl font-black text-slate-800 dark:text-white font-display">
              {maxCurrentStreak} <span className="text-xs font-bold text-slate-400">days</span>
            </span>
          </div>

          {/* Streak Best */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/80 text-left flex flex-col justify-between h-[115px]">
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>All-time Max</span>
              <FiAward className="text-amber-500 w-4 h-4" />
            </div>
            <span className="text-3xl font-black text-slate-800 dark:text-white font-display">
              {maxLongestStreak} <span className="text-xs font-bold text-slate-400">days</span>
            </span>
          </div>

          {/* Productivity */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/80 text-left flex flex-col justify-between h-[115px]">
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Productivity</span>
              <FiZap className="text-indigo-500 w-4 h-4" />
            </div>
            <span className="text-3xl font-black text-slate-800 dark:text-white font-display">
              {completionRate}%
            </span>
          </div>

          {/* Active habits */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/80 text-left flex flex-col justify-between h-[115px]">
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Active Habits</span>
              <span className="text-slate-400">📦</span>
            </div>
            <span className="text-3xl font-black text-slate-800 dark:text-white font-display">
              {activeHabitsCount}
            </span>
          </div>

          {/* Completions today */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/80 text-left flex flex-col justify-between h-[115px] col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Completed Today</span>
              <FiCheckCircle className="text-emerald-500 w-4 h-4" />
            </div>
            <span className="text-3xl font-black text-slate-800 dark:text-white font-display">
              {completedTodayCount} <span className="text-xs font-bold text-slate-400">/ {activeHabitsCount}</span>
            </span>
          </div>
        </div>

        {/* Daily Challenge Banner Card */}
        <div className="glass-panel rounded-3xl p-5 border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:border-indigo-500/10 text-left relative overflow-hidden flex flex-col justify-between h-[115px] lg:h-auto">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none"></div>
          <div className="z-10">
            <div className="flex items-center space-x-1 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              <span>⚡ Daily Challenge</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 text-[8px] font-extrabold uppercase">
                +{challenge.points} pts
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white font-display tracking-tight mt-1 leading-snug">
              {challenge.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {challenge.description}
            </p>
          </div>
        </div>
      </div>

      {/* Habits Header Controls: Search & Category Filter */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-left font-display">
            Today's Habits
          </h2>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-72">
              <FiSearch className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search habits..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all glass-panel"
              />
            </div>

            {/* Add Habit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenAddModal}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-500/15 cursor-pointer whitespace-nowrap"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Habit</span>
            </motion.button>
          </div>
        </div>

        {/* Category Horizontal Filter Pill Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hidden">
          <div className="flex items-center space-x-1 bg-slate-100/50 dark:bg-slate-900/30 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-500 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Habit Cards list Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggleCompleteToday={onToggleCompleteToday}
              onToggleDay={onToggleDay}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredHabits.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-panel rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 max-w-xl mx-auto"
        >
          <span className="text-4xl">🔮</span>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-4 font-display">No habits found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-xs mx-auto leading-relaxed">
            {search || selectedCategory !== 'All' 
              ? "We couldn't find any habits matching your search filter." 
              : "Let's kickstart your productivity! Click the Add Habit button to start tracking your daily progress."
            }
          </p>
          {(search || selectedCategory !== 'All') && (
            <button
              onClick={() => { setSearch(''); setSelectedCategory('All'); }}
              className="mt-4 text-xs font-bold text-indigo-500 hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};
