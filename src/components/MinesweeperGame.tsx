'use client';

import { useState, useEffect, useCallback } from 'react';
import { GameBoard } from './GameBoard';
import { GameControls } from './GameControls';
import { GameModal } from './GameModal';
import { GameTitle } from './GameTitle';
import { 
  Cell, 
  GameStatus, 
  GameState,
  createEmptyBoard, 
  initializeBoard, 
  revealCell, 
  toggleFlag, 
  checkWinCondition, 
  countFlags, 
  chordClick,
  BOARD_SIZE, 
  MINE_COUNT 
} from '@/lib/game-logic';
import { storage } from '@/lib/utils';
import { sendGAEvent } from '@next/third-parties/google';

const GAME_SAVE_KEY = 'minesweeper-current-game';

export function MinesweeperGame() {
  const [board, setBoard] = useState<Cell[][]>(createEmptyBoard(BOARD_SIZE));
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [timer, setTimer] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [firstClick, setFirstClick] = useState(true);
  const [explodedCell, setExplodedCell] = useState<{ row: number; col: number } | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [gameSeed, setGameSeed] = useState<string>('');

  // Save game state to localStorage
  const saveGame = useCallback(() => {
    if (gameStatus === 'playing' || gameStatus === 'won' || gameStatus === 'lost') {
      const gameState: GameState = {
        board,
        gameStatus,
        mineCount: MINE_COUNT,
        flagCount: countFlags(board, BOARD_SIZE),
        revealedCount: board.flat().filter(cell => cell.isRevealed).length,
        firstClick,
        startTime,
        endTime: gameStatus !== 'playing' ? Date.now() : null,
        seed: gameSeed
      };
      storage.set(GAME_SAVE_KEY, gameState);
    }
  }, [board, gameStatus, firstClick, startTime, gameSeed]);

  // Load game state from localStorage
  const loadGame = useCallback(() => {
    const savedGame = storage.get(GAME_SAVE_KEY) as GameState;
    if (savedGame && savedGame.board && savedGame.gameStatus !== 'won' && savedGame.gameStatus !== 'lost') {
      setBoard(savedGame.board);
      setGameStatus(savedGame.gameStatus);
      setFirstClick(savedGame.firstClick);
      setGameSeed(savedGame.seed || '');
      
      if (savedGame.startTime) {
        setStartTime(savedGame.startTime);
        if (savedGame.gameStatus === 'playing') {
          setTimer(Math.floor((Date.now() - savedGame.startTime) / 1000));
        }
      }
    } else {
      // Start fresh game
      resetGame();
    }
  }, []);

  // Reset game to initial state
  const resetGame = useCallback(() => {
    const newBoard = createEmptyBoard(BOARD_SIZE);
    const newSeed = Math.random().toString(36).substring(2, 15);
    
    setBoard(newBoard);
    setGameStatus('playing');
    setTimer(0);
    setStartTime(null);
    setFirstClick(true);
    setExplodedCell(undefined);
    setShowModal(false);
    setGameSeed(newSeed);
    
    // Clear saved game
    storage.remove(GAME_SAVE_KEY);
  }, []);

  // Initialize game on mount
  useEffect(() => {
    loadGame();
  }, [loadGame]);

  // Save game whenever state changes
  useEffect(() => {
    if (!firstClick) {
      saveGame();
    }
  }, [board, gameStatus, firstClick, startTime, saveGame]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameStatus === 'playing' && startTime) {
      interval = setInterval(() => {
        setTimer(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [gameStatus, startTime]);

  // Handle cell left click
  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameStatus !== 'playing') return;
    
    const cell = board[row][col];
    if (cell.isRevealed || cell.isFlagged) return;

    let newBoard = board;
    let newStartTime = startTime;
    
    // First click - initialize board
    if (firstClick) {
      newBoard = initializeBoard(BOARD_SIZE, MINE_COUNT, row, col, gameSeed);
      setFirstClick(false);
      newStartTime = Date.now();
      setStartTime(newStartTime);
      
      // Track game start event
      sendGAEvent({
        event: 'game_start',
        game_seed: gameSeed,
        board_size: BOARD_SIZE,
        mine_count: MINE_COUNT
      });
    }

    // Check if clicking on mine
    if (newBoard[row][col].isMine) {
      // Game over
      newBoard = newBoard.map(row => 
        row.map(cell => ({ ...cell, isRevealed: cell.isMine ? true : cell.isRevealed }))
      );
      setBoard(newBoard);
      setGameStatus('lost');
              setExplodedCell({ row, col });
        setShowModal(true);
        
        // Track game over event
        sendGAEvent({
          event: 'game_over',
          game_time: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0,
          cells_revealed: board.flat().filter(cell => cell.isRevealed).length,
          flags_used: board.flat().filter(cell => cell.isFlagged).length,
          game_seed: gameSeed
        });
        
        return;
    }

    // Reveal cell
    newBoard = revealCell(newBoard, row, col, BOARD_SIZE);
    setBoard(newBoard);

    // Check win condition
    if (checkWinCondition(newBoard, BOARD_SIZE, MINE_COUNT)) {
      setGameStatus('won');
      setShowModal(true);
      
      // Track game won event
      sendGAEvent({
        event: 'game_won',
        game_time: newStartTime ? Math.floor((Date.now() - newStartTime) / 1000) : 0,
        cells_revealed: newBoard.flat().filter(cell => cell.isRevealed).length,
        flags_used: newBoard.flat().filter(cell => cell.isFlagged).length,
        game_seed: gameSeed
      });
    }
  }, [board, gameStatus, firstClick, startTime, gameSeed]);

  // Handle cell right click (flag)
  const handleCellRightClick = useCallback((row: number, col: number) => {
    if (gameStatus !== 'playing') return;
    
    const newBoard = toggleFlag(board, row, col);
    setBoard(newBoard);
  }, [board, gameStatus]);

  // Handle cell middle click (chord)
  const handleCellMiddleClick = useCallback((row: number, col: number) => {
    if (gameStatus !== 'playing') return;
    
    const newBoard = chordClick(board, row, col, BOARD_SIZE);
    if (newBoard === board) return; // No change
    
    setBoard(newBoard);
    
    // Check if we hit a mine during chord
    let hitMine = false;
    let explodedPos: { row: number; col: number } | undefined;
    
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (newBoard[r][c].isMine && newBoard[r][c].isRevealed && 
            (!board[r][c].isRevealed)) {
          hitMine = true;
          explodedPos = { row: r, col: c };
          break;
        }
      }
      if (hitMine) break;
    }
    
    if (hitMine) {
      // Reveal all mines
      const finalBoard = newBoard.map(row => 
        row.map(cell => ({ ...cell, isRevealed: cell.isMine ? true : cell.isRevealed }))
      );
      setBoard(finalBoard);
      setGameStatus('lost');
      setExplodedCell(explodedPos);
      setShowModal(true);
      
      // Track game over event from chord
      sendGAEvent({
        event: 'game_over',
        game_time: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0,
        cells_revealed: newBoard.flat().filter(cell => cell.isRevealed).length,
        flags_used: newBoard.flat().filter(cell => cell.isFlagged).length,
        game_seed: gameSeed,
        cause: 'chord_click'
      });
    } else if (checkWinCondition(newBoard, BOARD_SIZE, MINE_COUNT)) {
      setGameStatus('won');
      setShowModal(true);
      
      // Track game won event from chord
      sendGAEvent({
        event: 'game_won',
        game_time: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0,
        cells_revealed: newBoard.flat().filter(cell => cell.isRevealed).length,
        flags_used: newBoard.flat().filter(cell => cell.isFlagged).length,
        game_seed: gameSeed,
        cause: 'chord_click'
      });
    }
  }, [board, gameStatus]);

  // Handle reset
  const handleReset = useCallback(() => {
    // Track game reset event
    sendGAEvent({
      event: 'game_reset',
      game_time: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0,
      cells_revealed: board.flat().filter(cell => cell.isRevealed).length,
      flags_used: board.flat().filter(cell => cell.isFlagged).length,
      game_seed: gameSeed
    });
    
    resetGame();
  }, [resetGame, startTime, board, gameSeed]);

  const flagCount = countFlags(board, BOARD_SIZE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-4 sm:py-8 px-2 sm:px-4 transition-all duration-500 relative overflow-hidden">
      {/* Enhanced Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large animated blobs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 dark:from-blue-600/20 dark:to-cyan-600/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-2xl opacity-60 dark:opacity-40 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 dark:from-purple-600/20 dark:to-pink-600/20 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-2xl opacity-60 dark:opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-gradient-to-br from-pink-400/25 to-rose-400/25 dark:from-pink-600/15 dark:to-rose-600/15 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-2xl opacity-50 dark:opacity-30 animate-blob animation-delay-4000"></div>
        
        {/* Medium floating elements */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-indigo-400/25 to-blue-400/25 dark:from-indigo-600/15 dark:to-blue-600/15 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-50 dark:opacity-30 animate-blob animation-delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-gradient-to-br from-teal-400/25 to-green-400/25 dark:from-teal-600/15 dark:to-green-600/15 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-50 dark:opacity-30 animate-blob animation-delay-3000"></div>
        
        {/* Small sparkle elements */}
        <div className="absolute top-1/5 left-1/5 w-32 h-32 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 dark:from-yellow-600/15 dark:to-orange-600/15 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-lg opacity-60 dark:opacity-40 animate-blob animation-delay-5000"></div>
        <div className="absolute bottom-1/5 left-2/3 w-24 h-24 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 dark:from-emerald-600/15 dark:to-teal-600/15 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-lg opacity-60 dark:opacity-40 animate-blob animation-delay-6000"></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.02)_1px,transparent_0)] bg-[length:20px_20px] opacity-30"></div>
      </div>
      
      <div className="w-full max-w-5xl mx-auto relative z-10">
        <GameTitle />
        
        <div className="flex justify-center mb-6">
          <GameBoard
            board={board}
            onCellClick={handleCellClick}
            onCellRightClick={handleCellRightClick}
            onCellMiddleClick={handleCellMiddleClick}
            gameStatus={gameStatus}
            explodedCell={explodedCell}
          />
        </div>
        
        <div className="flex justify-center">
          <GameControls
            mineCount={MINE_COUNT}
            flagCount={flagCount}
            timer={timer}
            gameStatus={gameStatus}
            onReset={handleReset}
          />
        </div>
        
        <GameModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          gameStatus={gameStatus as 'won' | 'lost'}
          timer={timer}
          onReset={handleReset}
        />
      </div>
    </div>
  );
} 