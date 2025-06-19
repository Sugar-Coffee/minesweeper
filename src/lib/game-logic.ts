// No imports needed for game logic

export type CellState = 'hidden' | 'revealed' | 'flagged' | 'question';
export type GameStatus = 'playing' | 'won' | 'lost';

export interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  isQuestion: boolean;
  neighborMines: number;
  row: number;
  col: number;
}

export interface GameState {
  board: Cell[][];
  gameStatus: GameStatus;
  mineCount: number;
  flagCount: number;
  revealedCount: number;
  firstClick: boolean;
  startTime: number | null;
  endTime: number | null;
  seed?: string;
}

export const BOARD_SIZE = 15;
export const MINE_COUNT = 30; // Reduced from 45 to 30 (13.3% of 225 cells)

// Initialize empty board
export function createEmptyBoard(size: number = BOARD_SIZE): Cell[][] {
  const board: Cell[][] = [];
  
  for (let row = 0; row < size; row++) {
    board[row] = [];
    for (let col = 0; col < size; col++) {
      board[row][col] = {
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        isQuestion: false,
        neighborMines: 0,
        row,
        col,
      };
    }
  }
  
  return board;
}

// Generate mine positions using seeded random
export function generateMines(
  size: number,
  mineCount: number,
  seed: string,
  firstClickRow: number,
  firstClickCol: number
): boolean[][] {
  // Use Math.random() seeded by the seed string for simplicity
  // Create a simple deterministic approach
  let seedValue = 0;
  for (let i = 0; i < seed.length; i++) {
    seedValue += seed.charCodeAt(i);
  }
  
  // Create mine layout - start with no mines
  const mines: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));
  
  let minesPlaced = 0;
  const maxAttempts = mineCount * 20; // Increase attempts
  let attempts = 0;
  
  // Use a simple linear congruential generator for better reliability
  let rngState = seedValue % 2147483647;
  
  const nextRandom = () => {
    rngState = (rngState * 16807) % 2147483647;
    return (rngState - 1) / 2147483646; // Returns 0-1
  };
  
  while (minesPlaced < mineCount && attempts < maxAttempts) {
    // Generate random position
    const row = Math.floor(nextRandom() * size);
    const col = Math.floor(nextRandom() * size);
    
    // Validate bounds (should always be valid now)
    if (row >= 0 && row < size && col >= 0 && col < size) {
      // Check if position is valid (not in first click area and not already a mine)
      const isFirstClickArea = Math.abs(row - firstClickRow) <= 1 && Math.abs(col - firstClickCol) <= 1;
      
      if (!isFirstClickArea && !mines[row][col]) {
        mines[row][col] = true;
        minesPlaced++;
      }
    }
    
    attempts++;
  }
  
  return mines;
}

// Calculate neighbor mine counts
export function calculateNeighborCounts(board: Cell[][], size: number): void {
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!board[row][col].isMine) {
        let count = 0;
        directions.forEach(([dRow, dCol]) => {
          const newRow = row + dRow;
          const newCol = col + dCol;
          if (
            newRow >= 0 && newRow < size &&
            newCol >= 0 && newCol < size &&
            board[newRow][newCol].isMine
          ) {
            count++;
          }
        });
        board[row][col].neighborMines = count;
      }
    }
  }
}

// Initialize board with mines after first click
export function initializeBoard(
  size: number,
  mineCount: number,
  firstClickRow: number,
  firstClickCol: number,
  customSeed?: string
): Cell[][] {
  const seed = customSeed || Math.random().toString(36).substring(2, 15);
  const board = createEmptyBoard(size);
  const mines = generateMines(size, mineCount, seed, firstClickRow, firstClickCol);
  
  // Place mines
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      board[row][col].isMine = mines[row][col];
    }
  }
  
  calculateNeighborCounts(board, size);
  return board;
}

// Reveal cell and adjacent empty cells (flood fill)
export function revealCell(board: Cell[][], row: number, col: number, size: number): Cell[][] {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  const visited = new Set<string>();
  
  function flood(r: number, c: number) {
    const key = `${r},${c}`;
    if (
      r < 0 || r >= size ||
      c < 0 || c >= size ||
      visited.has(key) ||
      newBoard[r][c].isRevealed ||
      newBoard[r][c].isFlagged ||
      newBoard[r][c].isMine
    ) {
      return;
    }
    
    visited.add(key);
    newBoard[r][c].isRevealed = true;
    
    // If this cell has no neighboring mines, reveal all neighbors
    if (newBoard[r][c].neighborMines === 0) {
      const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ];
      
      directions.forEach(([dRow, dCol]) => {
        flood(r + dRow, c + dCol);
      });
    }
  }
  
  flood(row, col);
  return newBoard;
}

// Toggle flag on cell
export function toggleFlag(board: Cell[][], row: number, col: number): Cell[][] {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  const cell = newBoard[row][col];
  
  if (cell.isRevealed) return newBoard;
  
  if (cell.isFlagged) {
    cell.isFlagged = false;
    cell.isQuestion = true;
  } else if (cell.isQuestion) {
    cell.isQuestion = false;
  } else {
    cell.isFlagged = true;
  }
  
  return newBoard;
}

// Check win condition
export function checkWinCondition(board: Cell[][], size: number, mineCount: number): boolean {
  let revealedSafeCells = 0;
  const totalSafeCells = (size * size) - mineCount;
  
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = board[row][col];
      if (!cell.isMine && cell.isRevealed) {
        revealedSafeCells++;
      }
    }
  }
  
  return revealedSafeCells === totalSafeCells;
}

// Count flags
export function countFlags(board: Cell[][], size: number): number {
  let count = 0;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col].isFlagged) {
        count++;
      }
    }
  }
  return count;
}

// Get adjacent cells for chord clicking
export function getAdjacentCells(board: Cell[][], row: number, col: number, size: number): Cell[] {
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];
  
  const adjacent: Cell[] = [];
  directions.forEach(([dRow, dCol]) => {
    const newRow = row + dRow;
    const newCol = col + dCol;
    if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
      adjacent.push(board[newRow][newCol]);
    }
  });
  
  return adjacent;
}

// Chord click (reveal all unflagged neighbors if correct number of flags)
export function chordClick(board: Cell[][], row: number, col: number, size: number): Cell[][] {
  const cell = board[row][col];
  if (!cell.isRevealed || cell.neighborMines === 0) {
    return board;
  }
  
  const adjacent = getAdjacentCells(board, row, col, size);
  const flaggedCount = adjacent.filter(c => c.isFlagged).length;
  
  // Only chord if the number of flags matches the number on the cell
  if (flaggedCount !== cell.neighborMines) {
    return board;
  }
  
  let newBoard = [...board.map(row => [...row.map(cell => ({ ...cell }))])];
  
  // Reveal all unflagged, unrevealed adjacent cells
  adjacent.forEach(adjCell => {
    if (!adjCell.isFlagged && !adjCell.isRevealed) {
      newBoard = revealCell(newBoard, adjCell.row, adjCell.col, size);
    }
  });
  
  return newBoard;
} 