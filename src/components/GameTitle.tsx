'use client';

import { motion } from 'framer-motion';
import { Bomb, Sparkles } from 'lucide-react';

export function GameTitle() {
  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="flex items-center justify-center gap-3 mb-2">
        <motion.div
          initial={{ rotate: -45, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
        >
          <Bomb className="w-8 h-8 text-red-500" />
        </motion.div>
        
        <motion.h1
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 dark:from-blue-400 dark:via-purple-400 dark:to-red-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
        >
          Minesweeper
        </motion.h1>
        
        <motion.div
          initial={{ rotate: 45, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 400 }}
        >
          <Sparkles className="w-8 h-8 text-yellow-500" />
        </motion.div>
      </div>
      
      <motion.p
        className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        Clear the minefield without hitting a mine. Use logic and deduction to master this classic puzzle game!
      </motion.p>
      

    </motion.div>
  );
} 