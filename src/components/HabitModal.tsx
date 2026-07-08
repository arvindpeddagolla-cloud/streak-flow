import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck } from 'react-icons/fi';
import type { Habit } from '../types/habit';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Omit<Habit, 'id' | 'createdAt' | 'streakCurrent' | 'streakLongest' | 'history'>) => void;
  habitToEdit?: Habit | null;
}

const CATEGORIES = [
  { name: 'Study', defaultEmoji: '📚', color: 'amber' },
  { name: 'Coding', defaultEmoji: '💻', color: 'indigo' },
  { name: 'Reading', defaultEmoji: '📖', color: 'emerald' },
  { name: 'Exercise', defaultEmoji: '🏋️', color: 'rose' },
  { name: 'Meditation', defaultEmoji: '🧘', color: 'violet' },
  { name: 'Water', defaultEmoji: '💧', color: 'sky' },
  { name: 'Health', defaultEmoji: '🍏', color: 'green' },
  { name: 'Productivity', defaultEmoji: '⚡', color: 'yellow' },
  { name: 'Personal', defaultEmoji: '❤️', color: 'pink' }
];

const COLORS = ['indigo', 'violet', 'rose', 'emerald', 'amber', 'sky', 'green', 'pink', 'yellow'];

export const HabitModal: React.FC<HabitModalProps> = ({ isOpen, onClose, onSave, habitToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [emoji, setEmoji] = useState(CATEGORIES[0].defaultEmoji);
  const [color, setColor] = useState(CATEGORIES[0].color);
  const [dailyGoal, setDailyGoal] = useState(1);

  // When editing, populate existing details
  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setDescription(habitToEdit.description);
      setCategory(habitToEdit.category);
      setEmoji(habitToEdit.emoji);
      setColor(habitToEdit.color);
      setDailyGoal(habitToEdit.dailyGoal);
    } else {
      setName('');
      setDescription('');
      setCategory(CATEGORIES[0].name);
      setEmoji(CATEGORIES[0].defaultEmoji);
      setColor(CATEGORIES[0].color);
      setDailyGoal(1);
    }
  }, [habitToEdit, isOpen]);

  // Autocomplete emoji and color when category changes (only for new habits)
  const handleCategoryChange = (catName: string) => {
    setCategory(catName);
    if (!habitToEdit) {
      const match = CATEGORIES.find(c => c.name === catName);
      if (match) {
        setEmoji(match.defaultEmoji);
        setColor(match.color);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      category,
      emoji,
      color,
      dailyGoal: Number(dailyGoal) || 1
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="glass-panel relative w-full max-w-xl rounded-3xl p-6 md:p-8 z-10 border border-white/20 dark:border-slate-800/80 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50 pb-4 mb-6">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight font-display bg-gradient-to-r from-indigo-500 to-pink-500 text-gradient">
                {habitToEdit ? 'Edit Habit' : 'Create New Habit'}
              </h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-5 text-left">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Habit Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Daily Running, Read a Book"
                  className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  maxLength={40}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is your motivation or target?"
                  className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all h-20 resize-none"
                  maxLength={150}
                />
              </div>

              {/* Category selector grid */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => handleCategoryChange(cat.name)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        category === cat.name
                          ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'border-slate-200/50 dark:border-slate-800/80 bg-white/30 dark:bg-slate-900/30 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xl mb-1">{cat.defaultEmoji}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Row: Emoji picker input, Color picker swatches, Daily Goal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                {/* Emoji & Daily Goal */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                      Custom Emoji
                    </label>
                    <input
                      type="text"
                      value={emoji}
                      onChange={(e) => setEmoji(e.target.value)}
                      placeholder="Emoji character"
                      className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      maxLength={4}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                      Daily Goal (times)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={dailyGoal}
                      onChange={(e) => setDailyGoal(Math.max(1, Number(e.target.value)))}
                      className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Color Swatch Picker */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    Visual Accent Color
                  </label>
                  <div className="grid grid-cols-3 gap-2 h-fit">
                    {COLORS.map((c) => {
                      const colorMap: Record<string, string> = {
                        indigo: 'bg-indigo-500 shadow-indigo-500/20',
                        violet: 'bg-violet-500 shadow-violet-500/20',
                        rose: 'bg-rose-500 shadow-rose-500/20',
                        emerald: 'bg-emerald-500 shadow-emerald-500/20',
                        amber: 'bg-amber-500 shadow-amber-500/20',
                        sky: 'bg-sky-500 shadow-sky-500/20',
                        green: 'bg-green-500 shadow-green-500/20',
                        pink: 'bg-pink-500 shadow-pink-500/20',
                        yellow: 'bg-yellow-500 shadow-yellow-500/20'
                      };

                      const isSelected = color === c;

                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`w-full h-11 rounded-xl cursor-pointer relative flex items-center justify-center transition-all ${colorMap[c]} ${
                            isSelected ? 'ring-4 ring-offset-2 ring-indigo-500 scale-95' : 'hover:scale-105'
                          }`}
                        >
                          {isSelected && <FiCheck className="text-white w-5 h-5 drop-shadow" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-indigo-500/10 active:opacity-95 transition-all cursor-pointer"
                >
                  {habitToEdit ? 'Apply Changes' : 'Create Habit'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
