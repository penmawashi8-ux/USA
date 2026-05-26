// タヌキ vs キツネ (Fox and Hounds ベースのボードゲーム)
// ルール:
//   - 盤面: 8x8、(row+col)%2===1 のマスのみ使用
//   - タヌキ (1匹): (7,4) スタート、上方向 (row=0) を目指す
//   - キツネ (4匹): (0,1),(0,3),(0,5),(0,7) スタート、下方向のみ移動可能
//   - タヌキが row=0 に到達 → タヌキの勝ち
//   - タヌキが動けなくなる → キツネの勝ち

export type Position = { row: number; col: number };
export type Player = 'tanuki' | 'fox';
export type GameStatus = 'playing' | 'tanuki_wins' | 'fox_wins';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Side = 'tanuki' | 'fox';

export interface GameState {
  tanukiPos: Position;
  foxPositions: Position[]; // 4匹のキツネ
  currentTurn: Player;
  status: GameStatus;
}

export const TANUKI_START: Position = { row: 7, col: 4 };
export const FOX_STARTS: Position[] = [
  { row: 0, col: 1 },
  { row: 0, col: 3 },
  { row: 0, col: 5 },
  { row: 0, col: 7 },
];

export function createInitialState(): GameState {
  return {
    tanukiPos: { ...TANUKI_START },
    foxPositions: FOX_STARTS.map((p) => ({ ...p })),
    currentTurn: 'tanuki',
    status: 'playing',
  };
}

export function isPlayable(pos: Position): boolean {
  return (
    pos.row >= 0 &&
    pos.row <= 7 &&
    pos.col >= 0 &&
    pos.col <= 7 &&
    (pos.row + pos.col) % 2 === 1
  );
}

export function posEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

export function isOccupied(state: GameState, pos: Position): boolean {
  return (
    posEqual(state.tanukiPos, pos) ||
    state.foxPositions.some((f) => posEqual(f, pos))
  );
}

export function getTanukiMoves(state: GameState): Position[] {
  const { row, col } = state.tanukiPos;
  return (
    [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ] as [number, number][]
  )
    .map(([dr, dc]) => ({ row: row + dr, col: col + dc }))
    .filter((p) => isPlayable(p) && !isOccupied(state, p));
}

export function getFoxMoves(state: GameState, foxIndex: number): Position[] {
  const { row, col } = state.foxPositions[foxIndex];
  // キツネは下方向 (row増加) のみ
  return (
    [
      [1, -1],
      [1, 1],
    ] as [number, number][]
  )
    .map(([dr, dc]) => ({ row: row + dr, col: col + dc }))
    .filter((p) => isPlayable(p) && !isOccupied(state, p));
}

export interface FoxMove {
  foxIndex: number;
  to: Position;
}

export function getAllFoxMoves(state: GameState): FoxMove[] {
  return state.foxPositions.flatMap((_, i) =>
    getFoxMoves(state, i).map((to) => ({ foxIndex: i, to }))
  );
}

function computeStatus(state: GameState): GameStatus {
  if (state.tanukiPos.row === 0) return 'tanuki_wins';

  if (state.currentTurn === 'fox') {
    if (getAllFoxMoves(state).length === 0) return 'tanuki_wins';
  }

  if (state.currentTurn === 'tanuki') {
    if (getTanukiMoves(state).length === 0) return 'fox_wins';
  }

  return 'playing';
}

export function applyTanukiMove(state: GameState, to: Position): GameState {
  const next: GameState = {
    ...state,
    tanukiPos: to,
    currentTurn: 'fox',
    status: 'playing',
  };
  next.status = computeStatus(next);
  return next;
}

export function applyFoxMove(
  state: GameState,
  foxIndex: number,
  to: Position
): GameState {
  const next: GameState = {
    ...state,
    foxPositions: state.foxPositions.map((f, i) => (i === foxIndex ? to : f)),
    currentTurn: 'tanuki',
    status: 'playing',
  };
  next.status = computeStatus(next);
  return next;
}
