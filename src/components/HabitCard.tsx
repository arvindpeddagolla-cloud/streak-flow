import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiCalendar, FiAward, FiCheck, FiPlus } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import type { Habit } from '../types/habit';
import { Calendar30Days } from './Calendar30Days';
import { getLocalDateString } from '../utils/storage';

interface HabitCardProps {
  habit: Habit;
  onToggleCompleteToday: (habitId: string) => void;
  onToggleDay: (habitId: string, dateStr: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggleCompleteToday,
  onToggleDay,
  onEdit,
  onDelete,
}) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const todayStr = getLocalDateString();
  const isCompletedToday = habit.history[todayStr] === true;

  // Calculate completion percentage over last 30 days
  const calculate30DayProgress = () => {
    const historyEntries = Object.entries(habit.history);
    if (historyEntries.length === 0) return 0;
    
    // Sort and get last 30 entries
    const last30 = historyEntries
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .slice(-30);
      
    const completedCount = last30.filter(([_, val]) => val).length;
    return Math.round((completedCount / Math.min(last30.length, 30)) * 100);
  };

  const completionPct = calculate30DayProgress();

  // Custom colors setup based on habit.color
  const colorMap: Record<string, { bg: string; text: string; border: string; accentBg: string; buttonBg: string; progress: string; ring: string }> = {
    indigo: {
      bg: 'from-indigo-500/10 to-indigo-600/5 dark:from-indigo-500/10 dark:to-indigo-900/5',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-500/20 dark:border-indigo-500/10',
      accentBg: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400',
      buttonBg: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      progress: 'bg-indigo-500',
      ring: 'focus:ring-indigo-500'
    },
    violet: {
      bg: 'from-violet-500/10 to-violet-600/5 dark:from-violet-500/10 dark:to-violet-900/5',
      text: 'text-violet-600 dark:text-violet-400',
      border: 'border-violet-500/20 dark:border-violet-500/10',
      accentBg: 'bg-violet-500/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400',
      buttonBg: 'bg-violet-600 hover:bg-violet-700 text-white',
      progress: 'bg-violet-500',
      ring: 'focus:ring-violet-500'
    },
    rose: {
      bg: 'from-rose-500/10 to-rose-600/5 dark:from-rose-500/10 dark:to-rose-900/5',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/20 dark:border-rose-500/10',
      accentBg: 'bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400',
      buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white',
      progress: 'bg-rose-500',
      ring: 'focus:ring-rose-500'
    },
    emerald: {
      bg: 'from-emerald-500/10 to-emerald-600/5 dark:from-emerald-500/10 dark:to-emerald-900/5',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/20 dark:border-emerald-500/10',
      accentBg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      progress: 'bg-emerald-500',
      ring: 'focus:ring-emerald-500'
    },
    amber: {
      bg: 'from-amber-500/10 to-amber-600/5 dark:from-amber-500/10 dark:to-amber-900/5',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/20 dark:border-amber-500/10',
      accentBg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400',
      buttonBg: 'bg-amber-600 hover:bg-amber-700 text-white',
      progress: 'bg-amber-500',
      ring: 'focus:ring-amber-500'
    },
    sky: {
      bg: 'from-sky-500/10 to-sky-600/5 dark:from-sky-500/10 dark:to-sky-900/5',
      text: 'text-sky-600 dark:text-sky-400',
      border: 'border-sky-500/20 dark:border-sky-500/10',
      accentBg: 'bg-sky-500/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400',
      buttonBg: 'bg-sky-600 hover:bg-sky-700 text-white',
      progress: 'bg-sky-500',
      ring: 'focus:ring-sky-500'
    },
    green: {
      bg: 'from-green-500/10 to-green-600/5 dark:from-green-500/10 dark:to-green-900/5',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-500/20 dark:border-green-500/10',
      accentBg: 'bg-green-500/10 text-green-600 dark:bg-green-400/10 dark:text-green-400',
      buttonBg: 'bg-green-600 hover:bg-green-700 text-white',
      progress: 'bg-green-500',
      ring: 'focus:ring-green-500'
    },
    pink: {
      bg: 'from-pink-500/10 to-pink-600/5 dark:from-pink-500/10 dark:to-pink-900/5',
      text: 'text-pink-600 dark:text-pink-400',
      border: 'border-pink-500/20 dark:border-pink-500/10',
      accentBg: 'bg-pink-500/10 text-pink-600 dark:bg-pink-400/10 dark:text-pink-400',
      buttonBg: 'bg-pink-600 hover:bg-pink-700 text-white',
      progress: 'bg-pink-500',
      ring: 'focus:ring-pink-500'
    },
    yellow: {
      bg: 'from-yellow-500/10 to-yellow-600/5 dark:from-yellow-500/10 dark:to-yellow-900/5',
      text: 'text-yellow-600 dark:text-yellow-400',
      border: 'border-yellow-500/20 dark:border-yellow-500/10',
      accentBg: 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-400',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      progress: 'bg-yellow-500',
      ring: 'focus:ring-yellow-500'
    }
  };

  const colors = colorMap[habit.color] || colorMap.indigo;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`glass-panel-interactive rounded-3xl p-6 border ${colors.border} bg-gradient-to-br ${colors.bg} relative overflow-hidden`}
    >
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-bl-full pointer-events-none"></div>

      {/* Top Header Row */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 flex items-center justify-center text-3xl shadow-sm">
            {habit.emoji || '🎯'}
          </div>
          <div className="text-left">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-1 ${colors.accentBg}`}>
              {habit.category}
            </span>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight font-display line-clamp-1 leading-snug">
              {habit.name}
            </h3>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(habit)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
            title="Edit Habit"
          >
            <FiEdit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(habit.id)}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Delete Habit"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      {habit.description && (
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 text-left line-clamp-2 leading-relaxed">
          {habit.description}
        </p>
      )}

      {/* Streaks and Completion rates grid */}
      <div className="grid grid-cols-3 gap-3 my-5 py-3 border-y border-slate-200/40 dark:border-slate-800/40">
        <div className="text-left">
          <div className="flex items-center text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-0.5">
            <FaFire className="text-orange-500 w-4 h-4 mr-1 shrink-0 animate-pulse" />
            Streak
          </div>
          <span className="text-lg font-black text-slate-800 dark:text-slate-100 leading-none">
            {habit.streakCurrent} <span className="text-xs font-bold text-slate-400">days</span>
          </span>
        </div>
        <div className="text-left">
          <div className="flex items-center text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-0.5">
            <FiAward className="text-amber-500 w-4 h-4 mr-1 shrink-0" />
            Best
          </div>
          <span className="text-lg font-black text-slate-800 dark:text-slate-100 leading-none">
            {habit.streakLongest} <span className="text-xs font-bold text-slate-400">days</span>
          </span>
        </div>
        <div className="text-left">
          <div className="flex items-center text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mb-0.5">
            🎯 30-Day
          </div>
          <span className="text-lg font-black text-slate-800 dark:text-slate-100 leading-none">
            {completionPct}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 mb-5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-500">
          <span>MONTHLY CONSISTENCY</span>
          <span className={colors.text}>{completionPct}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-200/50 dark:bg-slate-900/60 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${colors.progress}`}
          />
        </div>
      </div>

      {/* Footer Complete button + Calendar toggle */}
      <div className="flex items-center justify-between space-x-3 pt-1">
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
            showCalendar
              ? 'border-indigo-500/20 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400'
              : 'border-slate-200/50 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50'
          }`}
          title="Toggle 30-day Calendar"
        >
          <FiCalendar className="w-4 h-4" />
          <span>History</span>
        </button>

        {/* Checkmark Complete Today button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onToggleCompleteToday(habit.id)}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            isCompletedToday
              ? 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:border-indigo-500/20 dark:hover:border-indigo-400/20'
              : colors.buttonBg
          }`}
        >
          {isCompletedToday ? (
            <>
              <FiCheck className="w-4 h-4 text-emerald-500" />
              <span>Completed Today</span>
            </>
          ) : (
            <>
              <FiPlus className="w-4 h-4" />
              <span>Mark Complete</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Expanded 30-Day Grid Calendar */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Calendar30Days habit={habit} onToggleDay={onToggleDay} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
