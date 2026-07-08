import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { registerUser, loginUser } from '../utils/storage';
import type { User } from '../types/habit';

interface OnboardingProps {
  onComplete: (user: User) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    // 1. Validation
    if (mode === 'register' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }

    if (!trimmedEmail) {
      setError('Please enter your email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!trimmedPassword) {
      setError('Please enter a password.');
      return;
    }

    if (trimmedPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');

    // 2. Perform Auth Operations
    if (mode === 'register') {
      const res = registerUser(name, trimmedEmail, trimmedPassword);
      if (res.success && res.user) {
        onComplete(res.user);
      } else {
        setError(res.error || 'Failed to register.');
      }
    } else {
      const res = loginUser(trimmedEmail, trimmedPassword);
      if (res.success && res.user) {
        onComplete(res.user);
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    }
  };

  const toggleMode = () => {
    setMode(mode === 'register' ? 'login' : 'register');
    setError('');
    setPassword('');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 px-4">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-400 dark:bg-indigo-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-ambient-1 pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-400 dark:bg-violet-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-ambient-2 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-pink-400 dark:bg-pink-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-ambient-3 pointer-events-none"></div>

      {/* Onboarding Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="glass-panel relative w-full max-w-lg rounded-3xl p-6 md:p-10 text-center z-10 border border-white/40 dark:border-white/10 shadow-2xl"
      >
        {/* Animated Brand Logo */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="mx-auto w-16 h-16 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6"
        >
          <span className="text-3xl text-white font-bold select-none">📈</span>
        </motion.div>

        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 font-display">
          Welcome to <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-gradient font-extrabold font-display">StreakFlow</span>
        </h1>

        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
          "Small habits create extraordinary results. Let's begin your journey toward consistency."
        </p>

        {/* Tab Selector */}
        <div className="flex bg-slate-200/50 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-300/10 mb-6">
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer relative`}
          >
            {mode === 'register' && (
              <motion.div
                layoutId="authTab"
                className="absolute inset-0 bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 z-0"
              />
            )}
            <span className={`relative z-10 ${mode === 'register' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-400'}`}>
              Sign Up
            </span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer relative`}
          >
            {mode === 'login' && (
              <motion.div
                layoutId="authTab"
                className="absolute inset-0 bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 z-0"
              />
            )}
            <span className={`relative z-10 ${mode === 'login' ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'text-slate-400'}`}>
              Sign In
            </span>
          </button>
        </div>

        {/* Auth Forms */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'register' ? -15 : 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'register' ? 15 : -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Name field (Register only) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 pl-1">
                    What should we call you?
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm font-semibold"
                    maxLength={20}
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 pl-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm font-semibold"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 pl-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Choose a password (min. 6 chars)' : 'Enter your password'}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm font-semibold"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Validation Alert */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-rose-500 font-bold pl-1 pt-1"
            >
              ⚠️ {error}
            </motion.p>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-sm shadow-md hover:shadow-indigo-500/10 active:opacity-95 transition-all cursor-pointer mt-4"
          >
            {mode === 'register' ? 'Create Account & Continue' : 'Sign In & Continue'}
          </motion.button>
        </form>

        {/* Auth Toggle Link */}
        <div className="mt-6 text-center text-xs">
          <button
            onClick={toggleMode}
            className="text-slate-500 hover:text-indigo-500 font-semibold cursor-pointer underline transition-colors"
          >
            {mode === 'register'
              ? 'Already have an account? Sign In'
              : "New to StreakFlow? Create Account"
            }
          </button>
        </div>
      </motion.div>
    </div>
  );
};
