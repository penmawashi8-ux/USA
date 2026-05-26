// うさぎと猟犬 - グラフボード版
//
// ボード (10ノード):
//
//   A(0,1)---B(0,3)---C(0,5)
//   |\ /  \ / \ |
//   E(1,0)--F(1,2)--G(1,4)--H(1,6)  ← タヌキスタート
//   |/ \  / \ / |
//   I(2,1)---J(2,3)---K(2,5)
//
// 隣接ルール: 同行でcolが2違う、または隣行でcolが1違う (斜め)
//
// 初期位置: キツネ(猟犬)= A, E, I / タヌキ(うさぎ) = H
// 先手: キツネ
// キツネの移動: col が増える隣接ノードのみ (前進のみ)
// タヌキの移動: 任意の隣接ノード
// キツネ勝利: タヌキが動けなくなる
// タヌキ勝利: タヌキのcol < すべてのキツネのcol (包囲網を突破)

export type Player = 'tanuki' | 'fox';
export type GameStatus = 'playing' | 'tanuki_wins' | 'fox_wins';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Side = 'tanuki' | 'fox';

export interface NodePos {
  id: string;
  row: number; // 表示用座標 (0=上, 1=中, 2=下)
  col: number; // 表示用座標 (0,1,2,3,4,5,6)
}

// ボードノード定義
export const NODES: NodePos[] = [
  { id: 'A', row: 0, col: 1 },
  { id: 'B', row: 0, col: 3 },
  { id: 'C', row: 0, col: 5 },
  { id: 'E', row: 1, col: 0 },
  { id: 'F', row: 1, col: 2 },
  { id: 'G', row: 1, col: 4 },
  { id: 'H', row: 1, col: 6 },
  { id: 'I', row: 2, col: 1 },
  { id: 'J', row: 2, col: 3 },
  { id: 'K', row: 2, col: 5 },
];

// ノードIDからノードを取得
export function getNode(id: string): NodePos {
  return NODES.find((n) => n.id === id)!;
}

// 2ノード間が隣接しているか判定
function isAdjacent(a: NodePos, b: NodePos): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  if (dr === 0 && dc === 2) return true; // 同じ行、2列離れ
  if (dr === 1 && dc === 1) return true; // 隣の行、1列離れ (斜め)
  return false;
}

// 全エッジリスト (隣接ノードペア)
export const EDGES: [string, string][] = [];
for (let i = 0; i < NODES.length; i++) {
  for (let j = i + 1; j < NODES.length; j++) {
    if (isAdjacent(NODES[i], NODES[j])) {
      EDGES.push([NODES[i].id, NODES[j].id]);
    }
  }
}

// ゲーム状態
export interface GameState {
  tanukiId: string;         // タヌキのノードID
  foxIds: string[];          // キツネ3匹のノードID
  currentTurn: Player;
  status: GameStatus;
}

export const TANUKI_START = 'H';
export const FOX_STARTS = ['A', 'E', 'I'];

export function createInitialState(): GameState {
  return {
    tanukiId: TANUKI_START,
    foxIds: [...FOX_STARTS],
    currentTurn: 'fox', // 先手はキツネ
    status: 'playing',
  };
}

// 隣接ノードIDを取得
export function getNeighbors(nodeId: string): string[] {
  return EDGES.flatMap(([a, b]) => {
    if (a === nodeId) return [b];
    if (b === nodeId) return [a];
    return [];
  });
}

// タヌキの移動可能先 (任意の隣接ノード、空きのみ)
export function getTanukiMoves(state: GameState): string[] {
  return getNeighbors(state.tanukiId).filter(
    (id) => !state.foxIds.includes(id)
  );
}

// キツネ1匹の移動可能先 (前進のみ: col が増える方向)
export function getFoxMoves(state: GameState, foxIndex: number): string[] {
  const fox = getNode(state.foxIds[foxIndex]);
  return getNeighbors(state.foxIds[foxIndex]).filter((id) => {
    if (id === state.tanukiId) return false;
    if (state.foxIds.includes(id)) return false;
    const target = getNode(id);
    return target.col > fox.col; // 前進のみ
  });
}

export interface FoxMove {
  foxIndex: number;
  to: string;
}

export function getAllFoxMoves(state: GameState): FoxMove[] {
  return state.foxIds.flatMap((_, i) =>
    getFoxMoves(state, i).map((to) => ({ foxIndex: i, to }))
  );
}

function computeStatus(state: GameState): GameStatus {
  // タヌキがすべてのキツネより左に到達 → タヌキの勝ち
  const tanuki = getNode(state.tanukiId);
  const minFoxCol = Math.min(...state.foxIds.map((id) => getNode(id).col));
  if (tanuki.col < minFoxCol) return 'tanuki_wins';

  // タヌキが動けない → キツネの勝ち
  if (state.currentTurn === 'tanuki' && getTanukiMoves(state).length === 0) {
    return 'fox_wins';
  }

  // キツネが全員動けない → タヌキの勝ち (理論上レア)
  if (state.currentTurn === 'fox' && getAllFoxMoves(state).length === 0) {
    return 'tanuki_wins';
  }

  return 'playing';
}

export function applyTanukiMove(state: GameState, toId: string): GameState {
  const next: GameState = {
    ...state,
    tanukiId: toId,
    currentTurn: 'fox',
    status: 'playing',
  };
  next.status = computeStatus(next);
  return next;
}

export function applyFoxMove(
  state: GameState,
  foxIndex: number,
  toId: string
): GameState {
  const next: GameState = {
    ...state,
    foxIds: state.foxIds.map((id, i) => (i === foxIndex ? toId : id)),
    currentTurn: 'tanuki',
    status: 'playing',
  };
  next.status = computeStatus(next);
  return next;
}
