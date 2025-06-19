'use client';

import { motion } from 'framer-motion';
import { 
  RotateCcw, 
  Sun, 
  Moon, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Flag,
  Timer,
  Zap
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { format } from 'date-fns';

interface GameHeaderProps {
  mineCount: number;
  flagCount: number;
  timer: number;
  gameStatus: 'playing' | 'won' | 'lost';
  failCount: number;
  currentDate: Date;
  onReset: () => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onDateSelect: () => void;
}

export function GameHeader({
  mineCount,
  flagCount,
  timer,
  gameStatus,
  failCount,
  currentDate,
  onReset,
  onPreviousDay,
  onNextDay,
  onDateSelect
}: GameHeaderProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusEmoji = () => {
    switch (gameStatus) {
      case 'won': return '🎉';
      case 'lost': return '💥';
      default: return '🤔';
    }
  };

  const isToday = format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Top Row - Date Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPreviousDay}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Previous</span>
        </button>

        <button
          onClick={onDateSelect}
          className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors"
        >
          <Calendar className="w-4 h-4" />
          <span className="font-semibold">
            {format(currentDate, 'MMM dd, yyyy')}
          </span>
          {isToday && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
              Today
            </span>
          )}
        </button>

        <button
          onClick={onNextDay}
          disabled={isToday}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-800"
        >
          <span className="text-sm">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Row - Game Stats and Controls */}
      <div className="flex items-center justify-between">
        {/* Left Side - Game Stats */}
        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900 rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            <Flag className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="font-bold text-red-700 dark:text-red-300">
              {mineCount - flagCount}
            </span>
          </motion.div>

          <motion.div
            className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900 rounded-lg"
            whileHover={{ scale: 1.05 }}
          >
            <Timer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-blue-700 dark:text-blue-300 font-mono">
              {formatTime(timer)}
            </span>
          </motion.div>

          {failCount > 0 && (
            <motion.div
              className="flex items-center gap-2 px-3 py-2 bg-orange-100 dark:bg-orange-900 rounded-lg"
              whileHover={{ scale: 1.05 }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <Zap className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span className="font-bold text-orange-700 dark:text-orange-300">
                {failCount} fail{failCount !== 1 ? 's' : ''}
              </span>
            </motion.div>
          )}
        </div>

        {/* Center - Reset Button */}
        <motion.button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold shadow-lg transition-all duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-xl">{getStatusEmoji()}</span>
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </motion.button>

        {/* Right Side - Theme Toggle */}
        <motion.button
          onClick={toggleTheme}
          className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-blue-600" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
} 