'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import { 
  Timer, 
  Flag, 
  Sun, 
  Moon,
  RotateCcw,
  Trophy
} from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';

interface GameControlsProps {
  mineCount: number;
  flagCount: number;
  timer: number;
  gameStatus: 'playing' | 'won' | 'lost';
  onReset: () => void;
}

export function GameControls({
  mineCount,
  flagCount,
  timer,
  gameStatus,
  onReset
}: GameControlsProps) {
  const { theme, setTheme, mounted } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (gameStatus) {
      case 'won': return Trophy;
      case 'lost': return RotateCcw;
      default: return RotateCcw;
    }
  };

  const getStatusColor = () => {
    switch (gameStatus) {
      case 'won': return 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700';
      case 'lost': return 'from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700';
      default: return 'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700';
    }
  };

  const StatusIcon = getStatusIcon();

  const handleReset = () => {
    sendGAEvent({
      event: 'game_reset_controls',
      game_status: gameStatus
    });
    onReset();
  };

  return (
    <motion.div
      className="inline-block"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.3 }}
    >
      {/* Compact Layout */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Compact Stats */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-gray-700 rounded-lg border border-red-200 dark:border-gray-600">
              <Flag className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="font-bold text-red-700 dark:text-red-300 text-sm">
                {mineCount - flagCount}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-gray-700 rounded-lg border border-blue-200 dark:border-gray-600">
              <Timer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-blue-700 dark:text-blue-300 text-sm font-mono">
                {formatTime(timer)}
              </span>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleReset}
              className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${getStatusColor()} text-white rounded-lg font-semibold shadow-md transition-all duration-200 text-sm`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <StatusIcon className="w-4 h-4" />
              <span>
                {gameStatus === 'won' ? 'Perfect!' : gameStatus === 'lost' ? 'Try Again' : 'Reset'}
              </span>
            </motion.button>

            <motion.button
              onClick={toggleTheme}
              className="p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {!mounted ? (
                <Sun className="w-4 h-4 text-gray-400" />
              ) : theme === 'dark' ? (
                <Sun className="w-4 h-4 text-yellow-500" />
              ) : (
                <Moon className="w-4 h-4 text-blue-600" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 