import React from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { FiTrendingUp, FiCheckCircle, FiPieChart } from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import type { Habit } from '../types/habit';

interface AnalyticsProps {
  habits: Habit[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ habits }) => {
  // 1. Calculate General Metrics
  const totalCompletedDays = habits.reduce((sum, h) => {
    return sum + Object.values(h.history).filter(v => v).length;
  }, 0);

  const totalPossibleDays = habits.reduce((sum, h) => {
    return sum + Object.keys(h.history).length;
  }, 0);

  const productivityScore = totalPossibleDays > 0
    ? Math.round((totalCompletedDays / totalPossibleDays) * 100)
    : 0;

  const maxCurrentStreak = habits.reduce((max, h) => Math.max(max, h.streakCurrent), 0);
  const maxLongestStreak = habits.reduce((max, h) => Math.max(max, h.streakLongest), 0);

  // Find Best and Most Missed Habits
  let bestHabitName = 'None';
  let bestHabitRate = -1;
  let missedHabitName = 'None';
  let missedHabitRate = 101;

  const habitStats = habits.map(h => {
    const total = Object.keys(h.history).length;
    const completed = Object.values(h.history).filter(v => v).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { name: h.name, rate, currentStreak: h.streakCurrent, category: h.category, emoji: h.emoji, color: h.color };
  });

  habitStats.forEach(h => {
    if (h.rate > bestHabitRate) {
      bestHabitRate = h.rate;
      bestHabitName = `${h.emoji} ${h.name}`;
    }
    if (h.rate < missedHabitRate) {
      missedHabitRate = h.rate;
      missedHabitName = `${h.emoji} ${h.name}`;
    }
  });

  if (habits.length === 0) {
    bestHabitName = 'N/A';
    missedHabitName = 'N/A';
  }

  // 2. Generate Heatmap Data (Last 365 Days)
  const generateHeatmapData = () => {
    const data: { date: string; count: number; countLevel: number }[] = [];
    const today = new Date();
    
    // Create mapping of date string to total completions across all habits
    const completionsByDate: Record<string, number> = {};
    habits.forEach(h => {
      Object.entries(h.history).forEach(([dateStr, completed]) => {
        if (completed) {
          completionsByDate[dateStr] = (completionsByDate[dateStr] || 0) + 1;
        }
      });
    });

    // Generate last 365 days
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const offset = d.getTimezoneOffset();
      const localDate = new Date(d.getTime() - offset * 60 * 1000);
      const dateStr = localDate.toISOString().split('T')[0];
      const count = completionsByDate[dateStr] || 0;
      
      // Map completion counts to levels (0 to 4) for heatmap colors
      let countLevel = 0;
      if (count > 0) {
        if (count === 1) countLevel = 1;
        else if (count === 2) countLevel = 2;
        else if (count === 3) countLevel = 3;
        else countLevel = 4;
      }

      data.push({ date: dateStr, count, countLevel });
    }
    return data;
  };

  const heatmapData = generateHeatmapData();

  // 3. Weekly Completion Rate Chart Data (Mon to Sun)
  const getWeeklyChartData = () => {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const completions = Array(7).fill(0);
    const totals = Array(7).fill(0);

    habits.forEach(h => {
      Object.entries(h.history).forEach(([dateStr, completed]) => {
        const d = new Date(dateStr + 'T00:00:00');
        // getDay() is 0 for Sun, 1 for Mon...
        let dayIdx = d.getDay() - 1;
        if (dayIdx === -1) dayIdx = 6; // convert Sun to index 6
        
        totals[dayIdx]++;
        if (completed) {
          completions[dayIdx]++;
        }
      });
    });

    return weekdays.map((day, idx) => {
      const pct = totals[idx] > 0 ? Math.round((completions[idx] / totals[idx]) * 100) : 0;
      return { day, Completion: pct };
    });
  };

  const weeklyData = getWeeklyChartData();

  // 4. Monthly Completion Rate Chart Data (Past 6 Months)
  const getMonthlyChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats: Record<string, { completed: number; total: number }> = {};

    // Get list of last 6 months
    const today = new Date();
    const last6Months: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      last6Months.push(key);
      monthlyStats[key] = { completed: 0, total: 0 };
    }

    habits.forEach(h => {
      Object.entries(h.history).forEach(([dateStr, completed]) => {
        const key = dateStr.substring(0, 7); // "YYYY-MM"
        if (monthlyStats[key] !== undefined) {
          monthlyStats[key].total++;
          if (completed) {
            monthlyStats[key].completed++;
          }
        }
      });
    });

    return last6Months.map(key => {
      const year = key.substring(0, 4);
      const monthIdx = parseInt(key.substring(5, 7)) - 1;
      const label = `${months[monthIdx]} ${year.substring(2)}`;
      const stats = monthlyStats[key];
      const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
      return { month: label, Completion: pct };
    });
  };

  const monthlyData = getMonthlyChartData();

  // Heatmap rendering classes based on counts
  const heatmapColorClass = (level: number) => {
    switch (level) {
      case 1: return 'bg-indigo-200 dark:bg-indigo-900/40 border-indigo-300/30';
      case 2: return 'bg-indigo-350 dark:bg-indigo-700/60 border-indigo-400/30';
      case 3: return 'bg-indigo-500 dark:bg-indigo-500/80 border-indigo-600/30';
      case 4: return 'bg-indigo-700 dark:bg-indigo-400 border-indigo-800/30';
      default: return 'bg-slate-100 dark:bg-slate-900/60 border-slate-200/50 dark:border-slate-800/80';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* 1. Header & General Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-6 border border-white/20 dark:border-slate-800/80 md:col-span-2 flex flex-col justify-center text-left relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display mb-2">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Visualize your consistency trends, track streak records, and discover your highest performing habits.
          </p>
        </motion.div>

        {/* Productivity Score card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-panel rounded-3xl p-6 border border-white/20 dark:border-slate-800/80 text-left relative overflow-hidden flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Productivity Score</span>
            <FiPieChart className="text-indigo-500 w-5 h-5" />
          </div>
          <div className="my-3">
            <span className="text-4xl font-black tracking-tight text-slate-800 dark:text-white font-display">
              {productivityScore}%
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
            AVERAGE OVERALL COMPLETION RATE
          </span>
        </motion.div>

        {/* Total completed days card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-3xl p-6 border border-white/20 dark:border-slate-800/80 text-left relative overflow-hidden flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Completions</span>
            <FiCheckCircle className="text-emerald-500 w-5 h-5" />
          </div>
          <div className="my-3">
            <span className="text-4xl font-black tracking-tight text-slate-800 dark:text-white font-display">
              {totalCompletedDays}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
            TOTAL COMPLETED DAYS RECORDED
          </span>
        </motion.div>
      </div>

      {/* Streaks and rankings row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/80 text-left flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Top Active Streak</span>
            <div className="text-2xl font-black text-slate-800 dark:text-white">
              {maxCurrentStreak} days <span className="text-xs font-normal text-slate-400">/ max {maxLongestStreak}</span>
            </div>
          </div>
          <FaFire className="text-orange-500 w-10 h-10 animate-pulse" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/80 text-left flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Best Habit</span>
            <div className="text-xl font-black text-slate-800 dark:text-white truncate max-w-[170px] leading-tight">{bestHabitName}</div>
          </div>
          <FiTrendingUp className="text-indigo-500 w-10 h-10" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/80 text-left flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Needs Attention</span>
            <div className="text-xl font-black text-slate-800 dark:text-white truncate max-w-[170px] leading-tight">{missedHabitName}</div>
          </div>
          <span className="text-3xl filter saturate-75">⚠️</span>
        </motion.div>
      </div>

      {/* 2. Charts Row: Weekly & Monthly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Completion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-6 border border-white/20 dark:border-slate-800/80 shadow-lg text-left"
        >
          <h3 className="text-lg font-bold font-display mb-4 text-slate-800 dark:text-white">Weekly Consistency</h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                <Tooltip
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{
                    background: 'var(--toast-bg)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: 'var(--glass-shadow)'
                  }}
                />
                <Bar dataKey="Completion" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Completion Rate Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-6 border border-white/20 dark:border-slate-800/80 shadow-lg text-left"
        >
          <h3 className="text-lg font-bold font-display mb-4 text-slate-800 dark:text-white">Monthly Progress</h3>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorCompletes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.05)" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--toast-bg)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: 'var(--glass-shadow)'
                  }}
                />
                <Area type="monotone" dataKey="Completion" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCompletes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* 3. GitHub Style Contributions Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-6 border border-white/20 dark:border-slate-800/80 shadow-lg text-left"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-2 md:space-y-0">
          <div>
            <h3 className="text-lg font-bold font-display text-slate-800 dark:text-white">Completions Heatmap</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Your habit completion patterns over the last 365 days.</p>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 dark:text-slate-500">
            <span>Less</span>
            <span className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80"></span>
            <span className="w-3 h-3 rounded-sm bg-indigo-200 dark:bg-indigo-900/40"></span>
            <span className="w-3 h-3 rounded-sm bg-indigo-350 dark:bg-indigo-700/60"></span>
            <span className="w-3 h-3 rounded-sm bg-indigo-500 dark:bg-indigo-500/80"></span>
            <span className="w-3 h-3 rounded-sm bg-indigo-700 dark:bg-indigo-400"></span>
            <span>More</span>
          </div>
        </div>

        {/* Scrollable Heatmap Wrap */}
        <div className="overflow-x-auto scrollbar-hidden">
          <div className="min-w-[850px] py-2 flex flex-col space-y-1">
            <div className="grid grid-flow-col grid-rows-7 gap-1.5 auto-cols-max justify-start">
              {heatmapData.map((day) => {
                const dateObj = new Date(day.date + 'T00:00:00');
                const tooltipText = `${dateObj.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}: ${day.count} completion${day.count === 1 ? '' : 's'}`;

                return (
                  <div
                    key={day.date}
                    title={tooltipText}
                    className={`w-3.5 h-3.5 rounded-sm border transition-all duration-200 hover:scale-110 ${heatmapColorClass(
                      day.countLevel
                    )}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 4. Habit Ranking Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-6 border border-white/20 dark:border-slate-800/80 shadow-lg text-left"
      >
        <h3 className="text-lg font-bold font-display mb-4 text-slate-800 dark:text-white">Habit Performance Rankings</h3>
        
        {habits.length === 0 ? (
          <div className="text-center py-8 text-slate-400 font-semibold">
            Create habits to generate ranking data!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="pb-3 text-left pl-2">Habit</th>
                  <th className="pb-3 text-center">Category</th>
                  <th className="pb-3 text-center">Completion Rate</th>
                  <th className="pb-3 text-center">Current Streak</th>
                  <th className="pb-3 text-right pr-2">Progress Bar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/30 dark:divide-slate-800/30">
                {habitStats
                  .sort((a, b) => b.rate - a.rate)
                  .map((stat, idx) => {
                    const colorVariants: Record<string, string> = {
                      indigo: 'bg-indigo-500',
                      violet: 'bg-violet-500',
                      rose: 'bg-rose-500',
                      emerald: 'bg-emerald-500',
                      amber: 'bg-amber-500',
                      sky: 'bg-sky-500',
                      green: 'bg-green-500',
                      pink: 'bg-pink-500',
                      yellow: 'bg-yellow-500'
                    };
                    const colorClass = colorVariants[stat.color] || 'bg-indigo-500';

                    return (
                      <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10 transition-colors">
                        <td className="py-4 pl-2 font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-2 text-sm sm:text-base">
                          <span className="text-lg">{stat.emoji}</span>
                          <span>{stat.name}</span>
                        </td>
                        <td className="py-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                            {stat.category}
                          </span>
                        </td>
                        <td className="py-4 text-center font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                          {stat.rate}%
                        </td>
                        <td className="py-4 text-center font-extrabold text-indigo-500 dark:text-indigo-400 text-sm">
                          🔥 {stat.currentStreak} days
                        </td>
                        <td className="py-4 pr-2">
                          <div className="w-24 sm:w-32 h-2.5 rounded-full bg-slate-200/50 dark:bg-slate-900/60 ml-auto overflow-hidden">
                            <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${stat.rate}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};
