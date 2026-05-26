// ミニマックスとアルファベータ剪定による AI
// キツネ側は必勝戦略があるため、難易度 Hard では (ほぼ) 必ず勝利する

import {
  GameState,
  Position,
  Difficulty,
  FoxMove,
  getTanukiMoves,
  getAllFoxMoves,
  applyTanukiMove,
  applyFoxMove,
} from './gameLogic';

// 評価値: 正 → タヌキ有利、負 → キツネ有利
function evaluate(state: GameState): number {
  if (state.status === 'tanuki_wins') return 10000;
  if (state.status === 'fox_wins') return -10000;

  // タヌキが row=0 に近いほど高得点
  const rowScore = (7 - state.tanukiPos.row) * 25;

  // タヌキの移動可能数 (常にタヌキ視点で評価)
  const tanukiTurnState = { ...state, currentTurn: 'tanuki' as const };
  const mobility = getTanukiMoves(tanukiTurnState).length * 15;

  // タヌキがキツネ全員より前方 (小さい row) にいる場合ボーナス
  const minFoxRow = Math.min(...state.foxPositions.map((f) => f.row));
  const escapedBonus = state.tanukiPos.row < minFoxRow ? 300 : 0;

  // キツネの平均 row (キツネが前進するほどタヌキに不利)
  const avgFoxRow = state.foxPositions.reduce((s, f) => s + f.row, 0) / 4;
  const foxAdvance = avgFoxRow * 8;

  return rowScore + mobility + escapedBonus - foxAdvance;
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
  | { type: 'tanuki'; to: Position }
  | { type: 'fox'; foxIndex: number; to: Position };

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

    // Easy は 70% の確率でランダム
    if (difficulty === 'easy' && Math.random() < 0.7) {
      return { type: 'tanuki', to: randomChoice(moves) };
    }

    let bestVal = -Infinity;
    let bestTo: Position = moves[0];
    for (const to of moves) {
      const val = minimax(
        applyTanukiMove(state, to),
        depth - 1,
        -Infinity,
        Infinity
      );
      if (val > bestVal) {
        bestVal = val;
        bestTo = to;
      }
    }
    return { type: 'tanuki', to: bestTo };
  } else {
    const moves = getAllFoxMoves(state);
    if (moves.length === 0) return null;

    // Easy は 70% の確率でランダム
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
      if (val < bestVal) {
        bestVal = val;
        bestMove = move;
      }
    }
    return { type: 'fox', foxIndex: bestMove.foxIndex, to: bestMove.to };
  }
}
