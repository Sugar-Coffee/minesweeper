'use client';

import { motion } from 'framer-motion';
import { 
  Bomb, 
  Flag, 
  HelpCircle
} from 'lucide-react';
import { Cell } from '@/lib/game-logic';
import { cn } from '@/lib/utils';

interface GameCellProps {
  cell: Cell;
  onLeftClick: (row: number, col: number) => void;
  onRightClick: (row: number, col: number) => void;
  onMiddleClick?: (row: number, col: number) => void;
  gameStatus: 'playing' | 'won' | 'lost';
  isExploded?: boolean;
}

const numberColors = {
  1: 'text-blue-700 dark:text-blue-300',
  2: 'text-green-700 dark:text-green-300', 
  3: 'text-red-700 dark:text-red-300',
  4: 'text-purple-700 dark:text-purple-300',
  5: 'text-orange-700 dark:text-orange-300',
  6: 'text-pink-700 dark:text-pink-300',
  7: 'text-gray-800 dark:text-gray-100',
  8: 'text-gray-700 dark:text-gray-200',
};

export function GameCell({ 
  cell, 
  onLeftClick, 
  onRightClick, 
  onMiddleClick,
  gameStatus,
  isExploded = false
}: GameCellProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (gameStatus !== 'playing') return;
    
    if (e.button === 0) { // Left click
      onLeftClick(cell.row, cell.col);
    } else if (e.button === 1) { // Middle click
      onMiddleClick?.(cell.row, cell.col);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (gameStatus !== 'playing') return;
    onRightClick(cell.row, cell.col);
  };

  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      onRightClick(cell.row, cell.col);
    }, 500);

    const handleTouchEnd = () => {
      clearTimeout(timer);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchend', handleTouchEnd);
  };

  const getCellContent = () => {
    if (cell.isRevealed) {
      if (cell.isMine) {
        return (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: 1,
              rotate: 0
            }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 20,
              delay: isExploded ? 0 : Math.random() * 0.5 
            }}
          >
            {isExploded && (
              <>
                <motion.div
                  className="absolute inset-0 bg-yellow-400 rounded-full"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute inset-0 bg-orange-500 rounded-full"
                  initial={{ scale: 0, opacity: 0.8 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                />
              </>
            )}
            <motion.div
              animate={isExploded ? {
                scale: [1, 1.3, 1],
                rotate: [0, 10, -10, 0]
              } : {}}
              transition={isExploded ? {
                duration: 0.5,
                ease: "easeInOut"
              } : {}}
            >
              <Bomb 
                className={cn(
                  "w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 relative z-10",
                  isExploded ? "text-red-700 dark:text-red-300" : "text-gray-800 dark:text-gray-100"
                )} 
              />
            </motion.div>
          </motion.div>
        );
      } else if (cell.neighborMines > 0) {
        return (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
              "font-bold text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl select-none",
              numberColors[cell.neighborMines as keyof typeof numberColors]
            )}
          >
            {cell.neighborMines}
          </motion.span>
        );
      }
      return null;
    }

    if (cell.isFlagged) {
      return (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="relative"
        >
          <motion.div
            className="absolute inset-0 bg-red-200 dark:bg-red-800 rounded-full border-2 border-red-300 dark:border-red-600"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          />
          <Flag className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-700 dark:text-red-300 relative z-10" />
        </motion.div>
      );
    }

    if (cell.isQuestion) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <HelpCircle className="w-4 h-4 text-orange-500" />
        </motion.div>
      );
    }

    return null;
  };

  const getCellStyles = () => {
    const baseStyles = "w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 border border-gray-300 dark:border-gray-500 flex items-center justify-center cursor-pointer select-none transition-all duration-200 relative rounded-sm";
    
    if (cell.isRevealed) {
      if (cell.isMine) {
        return cn(
          baseStyles,
          "bg-red-100 dark:bg-red-950/90 border-red-300 dark:border-red-700",
          isExploded && "bg-red-400 dark:bg-red-700 animate-bounce shadow-lg shadow-red-500/50 border-red-500 dark:border-red-400"
        );
      }
      return cn(
        baseStyles,
        "bg-white dark:bg-gray-800/90 border-gray-300 dark:border-gray-600",
        "cursor-default shadow-inner"
      );
    }

    return cn(
      baseStyles,
      "bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-600 dark:to-gray-800",
      "border-gray-300 dark:border-gray-500 shadow-sm",
      "hover:from-white hover:to-gray-100 dark:hover:from-gray-500 dark:hover:to-gray-700",
      "hover:shadow-md hover:scale-105 transform hover:border-blue-300 dark:hover:border-blue-500",
      "active:scale-95 active:shadow-sm",
      gameStatus !== 'playing' && "cursor-default hover:from-gray-50 hover:to-gray-200 dark:hover:from-gray-600 dark:hover:to-gray-800 hover:scale-100 hover:border-gray-300 dark:hover:border-gray-500"
    );
  };

  return (
    <motion.div
      className={getCellStyles()}
      onMouseDown={handleClick}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      whileHover={gameStatus === 'playing' && !cell.isRevealed ? { scale: 1.05 } : {}}
      whileTap={gameStatus === 'playing' && !cell.isRevealed ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.2,
        ease: "easeOut"
      }}
    >
      {getCellContent()}
    </motion.div>
  );
} 