import React from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
import type { Achievement } from '../types/habit';

interface AchievementsProps {
  achievements: Achievement[];
}

export const Achievements: React.FC<AchievementsProps> = ({ achievements }) => {
  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;
  const totalCount = achievements.length;
  const progressPct = Math.round((unlockedCount / totalCount) * 100);

  // Dynamic ranking based on badges unlocked
  const getRankName = () => {
    if (unlockedCount === totalCount) return 'consistency Legend 👑';
    if (unlockedCount >= 4) return 'Streak Overlord 🚀';
    if (unlockedCount >= 2) return 'Habit Champion 🔥';
    if (unlockedCount >= 1) return 'Rising Star 🌟';
    return 'Habit Novice 🌱';
  };

  const getRankTheme = () => {
    if (unlockedCount === totalCount) return 'from-yellow-400 via-amber-500 to-orange-500';
    if (unlockedCount >= 4) return 'from-indigo-500 via-purple-500 to-pink-500';
    if (unlockedCount >= 2) return 'from-emerald-400 to-cyan-500';
    if (unlockedCount >= 1) return 'from-blue-400 to-indigo-500';
    return 'from-slate-400 to-slate-500';
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Top Banner Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-6 md:p-8 border border-white/20 dark:border-slate-800/80 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center md:justify-between space-y-6 md:space-y-0"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center md:text-left space-y-2 z-10">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-3">
            <h1 className="text-3xl font-extrabold tracking-tight font-display">
              Achievements & Badges
            </h1>
            <span className={`inline-flex px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getRankTheme()} shadow-sm select-none`}>
              {getRankName()}
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-lg">
            Stay consistent, push your boundaries, and unlock premium badges as your habits solidify.
          </p>
        </div>

        {/* Big circular progress chart */}
        <div className="flex items-center space-x-6 z-10 shrink-0">
          <div className="relative w-24 h-24 flex items-center justify-center bg-slate-100/50 dark:bg-slate-900/50 rounded-full border border-slate-200/50 dark:border-slate-800/80">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="38"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="text-slate-200 dark:text-slate-800"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="38"
                stroke="url(#grad)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 38}
                initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - progressPct / 100) }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-xl font-black text-slate-800 dark:text-white leading-none">
                {unlockedCount}
              </span>
              <span className="text-[10px] font-bold text-slate-400 mt-0.5">OF {totalCount}</span>
            </div>
          </div>
          <div className="text-left space-y-1">
            <span className="text-sm font-semibold text-slate-400">UNLOCK RATIO</span>
            <div className="text-2xl font-black text-slate-800 dark:text-white">{progressPct}%</div>
          </div>
        </div>
      </motion.div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((ach, idx) => {
          const isUnlocked = ach.unlockedAt !== null;

          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`glass-panel rounded-3xl p-6 border relative overflow-hidden flex flex-col justify-between h-[210px] ${
                isUnlocked
                  ? 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent dark:border-emerald-500/10 shadow-emerald-500/5 shadow-md'
                  : 'border-slate-200/50 dark:border-slate-800/80 bg-white/20 dark:bg-slate-900/10 opacity-70'
              }`}
            >
              {/* Top Row: Badge Icon & Lock Status */}
              <div className="flex items-start justify-between">
                {/* Badge Emoji container */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border ${
                    isUnlocked
                      ? 'bg-white dark:bg-slate-900 border-emerald-500/20 scale-105'
                      : 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 filter grayscale'
                  }`}
                >
                  {ach.badge}
                </div>

                {/* Status Indicator Badge */}
                {isUnlocked ? (
                  <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    <FiCheckCircle className="w-3.5 h-3.5" />
                    <span>Unlocked</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    <FiLock className="w-3.5 h-3.5" />
                    <span>Locked</span>
                  </span>
                )}
              </div>

              {/* Title & Desc */}
              <div className="text-left mt-4 space-y-1">
                <h3 className={`text-base font-bold tracking-tight font-display ${isUnlocked ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}`}>
                  {ach.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">
                  {ach.description}
                </p>
              </div>

              {/* Footer Date / Locked message */}
              <div className="border-t border-slate-200/30 dark:border-slate-800/30 pt-3 mt-4 text-left text-[10px] font-bold text-slate-400">
                {isUnlocked && ach.unlockedAt ? (
                  <span className="text-emerald-600 dark:text-emerald-500">
                    UNLOCKED ON {new Date(ach.unlockedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-600 uppercase">KEEP CRUSHING HABITS TO UNLOCK</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
