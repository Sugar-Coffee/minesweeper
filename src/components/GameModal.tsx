'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Bomb, RotateCcw } from 'lucide-react';
import { sendGAEvent } from '@next/third-parties/google';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameStatus: 'won' | 'lost';
  timer: number;
  onReset: () => void;
}

export function GameModal({
  isOpen,
  onClose,
  gameStatus,
  timer,
  onReset
}: GameModalProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTitle = () => {
    return gameStatus === 'won' ? 'Congratulations! 🎉' : 'Game Over 💥';
  };

  const getMessage = () => {
    if (gameStatus === 'won') {
      return 'Perfect! You cleared the minefield without hitting a mine!';
    }
    return 'You hit a mine! Better luck next time.';
  };

  const getIcon = () => {
    return gameStatus === 'won' ? Trophy : Bomb;
  };

  const Icon = getIcon();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative border border-gray-200 dark:border-gray-700"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                sendGAEvent({
                  event: 'modal_close',
                  modal_type: 'game_result',
                  game_result: gameStatus
                });
                onClose();
              }}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon and Title */}
            <div className="text-center mb-6">
              <motion.div
                className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  gameStatus === 'won' 
                    ? 'bg-yellow-100 dark:bg-yellow-900' 
                    : 'bg-red-100 dark:bg-red-900'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
              >
                <Icon 
                  className={`w-8 h-8 ${
                    gameStatus === 'won' 
                      ? 'text-yellow-600 dark:text-yellow-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`} 
                />
              </motion.div>
              
              <motion.h2
                className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {getTitle()}
              </motion.h2>
              
              <motion.p
                className="text-gray-600 dark:text-gray-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {getMessage()}
              </motion.p>
            </div>

            {/* Game Stats - Only show for wins */}
            {gameStatus === 'won' && (
              <motion.div
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Your Time</span>
                    <span className="text-3xl font-mono font-bold text-gray-900 dark:text-gray-100">
                      {formatTime(timer)}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                onClick={() => {
                  sendGAEvent({
                    event: 'modal_close',
                    modal_type: 'game_result',
                    game_result: gameStatus
                  });
                  onClose();
                }}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
              
              <button
                onClick={() => {
                  sendGAEvent({
                    event: 'new_game_from_modal',
                    previous_game_result: gameStatus,
                    game_time: timer
                  });
                  onReset();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
              >
                <RotateCcw className="w-4 h-4" />
                New Game
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 