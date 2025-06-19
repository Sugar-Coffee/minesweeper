'use client';

import { motion } from 'framer-motion';
import { GameCell } from './GameCell';
import { Cell } from '@/lib/game-logic';

interface GameBoardProps {
  board: Cell[][];
  onCellClick: (row: number, col: number) => void;
  onCellRightClick: (row: number, col: number) => void;
  onCellMiddleClick?: (row: number, col: number) => void;
  gameStatus: 'playing' | 'won' | 'lost';
  explodedCell?: { row: number; col: number };
}

export function GameBoard({
  board,
  onCellClick,
  onCellRightClick,
  onCellMiddleClick,
  gameStatus,
  explodedCell
}: GameBoardProps) {
  return (
    <motion.div
      className="w-full max-w-none md:inline-block md:max-w-fit relative"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {/* Glow effect behind the board */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-2xl blur-xl"></div>
      
      <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-1 sm:p-2 md:p-4 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="grid grid-cols-15 gap-0.5 sm:gap-1 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm p-1 sm:p-2 rounded-xl border border-gray-200/30 dark:border-gray-600/30">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <GameCell
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                onLeftClick={onCellClick}
                onRightClick={onCellRightClick}
                onMiddleClick={onCellMiddleClick}
                gameStatus={gameStatus}
                isExploded={
                  explodedCell?.row === rowIndex && explodedCell?.col === colIndex
                }
              />
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
} 