import React from 'react';
import type { Habit } from '../types/habit';
import { getLastNDays, getLocalDateString } from '../utils/storage';

interface Calendar30DaysProps {
  habit: Habit;
  onToggleDay: (habitId: string, dateStr: string) => void;
}

export const Calendar30Days: React.FC<Calendar30DaysProps> = ({ habit, onToggleDay }) => {
  const last30Days = getLastNDays(30);
  const todayStr = getLocalDateString();

  // Helper to get styling based on state and custom habit color
  const getDayStyles = (dateStr: string) => {
    const isCompleted = habit.history[dateStr] === true;
    const isToday = dateStr === todayStr;
    const isUpcoming = new Date(dateStr + 'T00:00:00') > new Date(todayStr + 'T00:00:00');

    // Tailored color variants based on habit.color
    const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
      indigo: { bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500/30', glow: 'ring-indigo-500/50' },
      violet: { bg: 'bg-violet-500', text: 'text-violet-500', border: 'border-violet-500/30', glow: 'ring-violet-500/50' },
      rose: { bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500/30', glow: 'ring-rose-500/50' },
      emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500/30', glow: 'ring-emerald-500/50' },
      amber: { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500/30', glow: 'ring-amber-500/50' },
      sky: { bg: 'bg-sky-500', text: 'text-sky-500', border: 'border-sky-500/30', glow: 'ring-sky-500/50' },
      green: { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500/30', glow: 'ring-green-500/50' },
      pink: { bg: 'bg-pink-500', text: 'text-pink-500', border: 'border-pink-500/30', glow: 'ring-pink-500/50' },
      yellow: { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500/30', glow: 'ring-yellow-500/50' }
    };

    const scheme = colorMap[habit.color] || colorMap.indigo;

    if (isUpcoming) {
      return 'border border-dashed border-slate-200 dark:border-slate-800 bg-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed';
    }

    if (isCompleted) {
      return `${scheme.bg} text-white shadow-sm shadow-black/10 border border-transparent`;
    }

    if (isToday) {
      return `border-2 border-indigo-500 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold ring-2 ${scheme.glow} animate-pulse`;
    }

    // Missed day style (past day that is not completed)
    return 'border border-rose-200 dark:border-rose-950/50 bg-rose-50/20 dark:bg-rose-950/10 text-rose-500 hover:bg-rose-100/30 dark:hover:bg-rose-950/25';
  };

  const getDayTooltip = (dateStr: string) => {
    const isCompleted = habit.history[dateStr] === true;
    const isToday = dateStr === todayStr;
    const isUpcoming = new Date(dateStr + 'T00:00:00') > new Date(todayStr + 'T00:00:00');

    const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      weekday: 'short'
    });

    if (isUpcoming) return `${formattedDate} - Upcoming`;
    if (isCompleted) return `${formattedDate} - Completed`;
    if (isToday) return `${formattedDate} - Today (Click to toggle)`;
    return `${formattedDate} - Missed`;
  };

  return (
    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          30-Day Completion History
        </span>
        <div className="flex items-center space-x-3 text-[10px] font-semibold text-slate-400">
          <span className="flex items-center"><span className="w-2 h-2 rounded bg-indigo-500 mr-1"></span> Done</span>
          <span className="flex items-center"><span className="w-2 h-2 rounded bg-rose-400 mr-1"></span> Missed</span>
          <span className="flex items-center"><span className="w-2 h-2 rounded border border-indigo-400 mr-1"></span> Today</span>
        </div>
      </div>

      {/* Grid of 30 days */}
      <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 justify-center">
        {last30Days.map((dateStr) => {
          const dateObj = new Date(dateStr + 'T00:00:00');
          const dayNum = dateObj.getDate();
          const isUpcoming = dateObj > new Date(todayStr + 'T00:00:00');

          return (
            <div
              key={dateStr}
              title={getDayTooltip(dateStr)}
              onClick={() => {
                if (!isUpcoming) {
                  onToggleDay(habit.id, dateStr);
                }
              }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold select-none cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 ${getDayStyles(
                dateStr
              )}`}
            >
              {dayNum}
            </div>
          );
        })}
      </div>
    </div>
  );
};
