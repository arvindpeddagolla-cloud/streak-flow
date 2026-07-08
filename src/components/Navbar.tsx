import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGrid, FiBarChart2, FiAward, FiSun, FiMoon, FiLogOut } from 'react-icons/fi';
import type { User } from '../types/habit';

interface NavbarProps {
  user: User;
  onThemeToggle: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onThemeToggle, onLogout }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <FiGrid className="w-5 h-5" /> },
    { path: '/analytics', label: 'Analytics', icon: <FiBarChart2 className="w-5 h-5" /> },
    { path: '/achievements', label: 'Achievements', icon: <FiAward className="w-5 h-5" /> },
  ];

  return (
    <nav className="glass-panel sticky top-0 z-40 border-b border-white/20 dark:border-slate-900/50 px-4 md:px-8 py-4 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/10 group-hover:scale-105 transition-transform">
            <span className="text-xl text-white">📈</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-gradient hidden sm:inline-block font-display">
            StreakFlow
          </span>
        </Link>

        {/* Middle Navigation - Glass pill tabs */}
        <div className="flex items-center space-x-1 bg-slate-200/50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-300/20">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link key={item.path} to={item.path} className="relative">
                <div
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {/* Background Slider */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 z-0"
                    />
                  )}
                  <span className="relative z-10 flex items-center space-x-1.5">
                    {item.icon}
                    <span className="hidden md:inline">{item.label}</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Right Section: Theme Toggle & User Info */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onThemeToggle}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-500/20 dark:hover:border-indigo-400/20 cursor-pointer transition-colors shadow-sm"
            aria-label="Toggle theme"
          >
            {user.theme === 'light' ? (
              <FiMoon className="w-5 h-5 animate-pulse" />
            ) : (
              <FiSun className="w-5 h-5 animate-pulse" />
            )}
          </motion.button>

          {/* User Profile Info */}
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-xl py-1.5 pl-3 pr-4 shadow-sm max-w-[150px] sm:max-w-none">
            <div className="w-7 h-7 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm select-none">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase leading-none">BUILDER</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate leading-snug">
                {user.name}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 text-slate-600 dark:text-rose-400 hover:text-rose-500 hover:border-rose-500/20 dark:hover:border-rose-400/20 cursor-pointer transition-colors shadow-sm"
            aria-label="Logout"
            title="Logout"
          >
            <FiLogOut className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </nav>
  );
};
