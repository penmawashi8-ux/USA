import {
  GameState,
  Difficulty,
  FoxMove,
  NodePos,
  getNode,
  getTanukiMoves,
  getAllFoxMoves,
  applyTanukiMove,
  applyFoxMove,
} from './gameLogic';

// 評価値: 正 → タヌキ有利、負 → キツネ有利
function evaluate(state: GameState): number {
  if (state.status === 'tanuki_wins') return 10000;
  if (state.status === 'fox_wins') return -10000;

  const tanuki: NodePos = getNode(state.tanukiId);
  const foxNodes: NodePos[] = state.foxIds.map(getNode);

  // タヌキは左に逃げたい (col が小さいほど良い)
  const tanukiColScore = (6 - tanuki.col) * 20;

  // タヌキの移動可能数 (多いほどタヌキ有利)
  const tempState = { ...state, currentTurn: 'tanuki' as const };
  const mobility = getTanukiMoves(tempState).length * 15;

  // キツネの平均 col (右に進むほどキツネは圧力をかけている)
  const avgFoxCol = foxNodes.reduce((s, f) => s + f.col, 0) / 3;
  const foxPressure = avgFoxCol * 10;

  // タヌキとキツネの col 差 (タヌキがキツネより左にいれば逃げやすい)
  const minFoxCol = Math.min(...foxNodes.map((f) => f.col));
  const escapePotential = (minFoxCol - tanuki.col) * 5;

  return tanukiColScore + mobility + escapePotential - foxPressure;
}

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number
): number {
  if (depth === 0 || state.status !== 'playing') return evaluate(state);

  if (state.currentTurn === 'tanuki') {
    let best = -Infinity;
    for (const to of getTanukiMoves(state)) {
      const val = minimax(applyTanukiMove(state, to), depth - 1, alpha, beta);
      if (val > best) best = val;
      if (best > alpha) alpha = best;
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const { foxIndex, to } of getAllFoxMoves(state)) {
      const val = minimax(
        applyFoxMove(state, foxIndex, to),
        depth - 1,
        alpha,
        beta
      );
      if (val < best) best = val;
      if (best < beta) beta = best;
      if (beta <= alpha) break;
    }
    return best;
  }
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export type AIMove =
  | { type: 'tanuki'; to: string }
  | { type: 'fox'; foxIndex: number; to: string };

const DEPTHS: Record<Difficulty, number> = {
  easy: 1,
  medium: 5,
  hard: 9,
};

export function getAIMove(state: GameState, difficulty: Difficulty): AIMove | null {
  const depth = DEPTHS[difficulty];

  if (state.currentTurn === 'tanuki') {
    const moves = getTanukiMoves(state);
    if (moves.length === 0) return null;
    if (difficulty === 'easy' && Math.random() < 0.7) {
      return { type: 'tanuki', to: randomChoice(moves) };
    }
    let bestVal = -Infinity;
    let bestTo = moves[0];
    for (const to of moves) {
      const val = minimax(applyTanukiMove(state, to), depth - 1, -Infinity, Infinity);
      if (val > bestVal) { bestVal = val; bestTo = to; }
    }
    return { type: 'tanuki', to: bestTo };
  } else {
    const moves = getAllFoxMoves(state);
    if (moves.length === 0) return null;
    if (difficulty === 'easy' && Math.random() < 0.7) {
      const m = randomChoice(moves);
      return { type: 'fox', foxIndex: m.foxIndex, to: m.to };
    }
    let bestVal = Infinity;
    let bestMove: FoxMove = moves[0];
    for (const move of moves) {
      const val = minimax(
        applyFoxMove(state, move.foxIndex, move.to),
        depth - 1,
        -Infinity,
        Infinity
      );
      if (val < bestVal) { bestVal = val; bestMove = move; }
    }
    return { type: 'fox', foxIndex: bestMove.foxIndex, to: bestMove.to };
  }
}
