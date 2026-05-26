'use client';

import { useState, useEffect } from 'react';
import {
  GameState,
  Player,
  NODES,
  EDGES,
  getNode,
  getTanukiMoves,
  getFoxMoves,
} from '@/lib/gameLogic';

// SVG 表示用の実座標 (col*80, row*100 で配置)
const COL_STEP = 85;
const ROW_STEP = 90;
const PAD_X = 55;
const PAD_Y = 55;
const SVG_W = COL_STEP * 6 + PAD_X * 2; // ~580
const SVG_H = ROW_STEP * 2 + PAD_Y * 2; // ~280

function nodeXY(id: string): { x: number; y: number } {
  const n = getNode(id);
  return {
    x: PAD_X + n.col * COL_STEP,
    y: PAD_Y + n.row * ROW_STEP,
  };
}

interface BoardProps {
  gameState: GameState;
  playerSide: Player | 'spectator';
  onTanukiMove?: (toId: string) => void;
  onFoxMove?: (foxIndex: number, toId: string) => void;
  isMyTurn: boolean;
  lastMove?: { from: string; to: string } | null;
}

export default function Board({
  gameState,
  playerSide,
  onTanukiMove,
  onFoxMove,
  isMyTurn,
  lastMove,
}: BoardProps) {
  const [selected, setSelected] = useState<
    { type: 'tanuki' } | { type: 'fox'; index: number } | null
  >(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);

  useEffect(() => {
    setSelected(null);
    setValidMoves([]);
  }, [gameState.currentTurn]);

  const handleNodeClick = (nodeId: string) => {
    if (!isMyTurn || gameState.status !== 'playing') return;

    // 有効な移動先をクリック
    if (selected && validMoves.includes(nodeId)) {
      if (selected.type === 'tanuki' && onTanukiMove) {
        onTanukiMove(nodeId);
      } else if (selected.type === 'fox' && onFoxMove) {
        onFoxMove(selected.index, nodeId);
      }
      setSelected(null);
      setValidMoves([]);
      return;
    }

    // タヌキを選択
    if (playerSide === 'tanuki' && gameState.currentTurn === 'tanuki') {
      if (nodeId === gameState.tanukiId) {
        setSelected({ type: 'tanuki' });
        setValidMoves(getTanukiMoves(gameState));
        return;
      }
    }

    // キツネを選択
    if (playerSide === 'fox' && gameState.currentTurn === 'fox') {
      const foxIdx = gameState.foxIds.indexOf(nodeId);
      if (foxIdx !== -1) {
        setSelected({ type: 'fox', index: foxIdx });
        setValidMoves(getFoxMoves(gameState, foxIdx));
        return;
      }
    }

    setSelected(null);
    setValidMoves([]);
  };

  const isTanuki = (id: string) => id === gameState.tanukiId;
  const foxIndex = (id: string) => gameState.foxIds.indexOf(id);
  const isFox = (id: string) => foxIndex(id) !== -1;
  const isSelected = (id: string) =>
    selected !== null &&
    ((selected.type === 'tanuki' && isTanuki(id)) ||
      (selected.type === 'fox' && isFox(id) && selected.index === foxIndex(id)));
  const isValidTarget = (id: string) => validMoves.includes(id);
  const isLastMoveTo = (id: string) => lastMove?.to === id;
  const isLastMoveFrom = (id: string) => lastMove?.from === id;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full h-auto"
        style={{ touchAction: 'manipulation' }}
      >
        {/* 背景 */}
        <rect width={SVG_W} height={SVG_H} rx="12" fill="#1a2f10" />

        {/* エッジ */}
        {EDGES.map(([a, b]) => {
          const pa = nodeXY(a);
          const pb = nodeXY(b);
          const isLastEdge =
            (lastMove?.from === a && lastMove?.to === b) ||
            (lastMove?.from === b && lastMove?.to === a);
          return (
            <line
              key={`${a}-${b}`}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke={isLastEdge ? '#a3e635' : '#3d6b2e'}
              strokeWidth={isLastEdge ? 3 : 2}
            />
          );
        })}

        {/* ノード */}
        {NODES.map((node) => {
          const { x, y } = nodeXY(node.id);
          const hasTanuki = isTanuki(node.id);
          const foxIdx = foxIndex(node.id);
          const hasFox = foxIdx !== -1;
          const isEmptyValidTarget = isValidTarget(node.id) && !hasTanuki && !hasFox;
          const selNode = isSelected(node.id);
          const isLast = isLastMoveTo(node.id);
          const wasLast = isLastMoveFrom(node.id);

          // ノード背景色
          let fill = '#2d4e1e';
          if (selNode) fill = '#78350f';
          else if (isLast) fill = '#365314';
          else if (wasLast) fill = '#1e3a0d';

          // ノードの枠色
          let stroke = '#4a7c35';
          let strokeWidth = 2;
          if (selNode) { stroke = '#fbbf24'; strokeWidth = 3; }
          else if (isEmptyValidTarget) { stroke = '#38bdf8'; strokeWidth = 3; }
          else if (isValidTarget(node.id)) { stroke = '#38bdf8'; strokeWidth = 2; }

          const r = 24;

          return (
            <g
              key={node.id}
              onClick={() => handleNodeClick(node.id)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={x}
                cy={y}
                r={r}
                fill={fill}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />

              {/* 移動可能先の点 */}
              {isEmptyValidTarget && (
                <circle cx={x} cy={y} r={8} fill="#38bdf8" opacity={0.7} />
              )}

              {/* ノードラベル (駒がない時) */}
              {!hasTanuki && !hasFox && (
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  fontSize="13"
                  fill="#4a7c35"
                  fontWeight="bold"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {node.id}
                </text>
              )}

              {/* タヌキ */}
              {hasTanuki && (
                <text
                  x={x}
                  y={y + 11}
                  textAnchor="middle"
                  fontSize="26"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  🦝
                </text>
              )}

              {/* キツネ */}
              {hasFox && (
                <text
                  x={x}
                  y={y + 11}
                  textAnchor="middle"
                  fontSize="26"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  🦊
                </text>
              )}
            </g>
          );
        })}

        {/* 方向ラベル */}
        <text x={PAD_X - 38} y={PAD_Y + ROW_STEP} fill="#4a7c35" fontSize="11" textAnchor="middle">← 逃走</text>
        <text x={SVG_W - PAD_X + 38} y={PAD_Y + ROW_STEP} fill="#e97316" fontSize="11" textAnchor="middle">スタート</text>
      </svg>
    </div>
  );
}
