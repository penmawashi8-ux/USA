'use client';

import { useState, useEffect } from 'react';
import {
  GameState,
  Position,
  Player,
  getTanukiMoves,
  getFoxMoves,
  posEqual,
} from '@/lib/gameLogic';

interface BoardProps {
  gameState: GameState;
  playerSide: Player | 'spectator';
  onTanukiMove?: (to: Position) => void;
  onFoxMove?: (foxIndex: number, to: Position) => void;
  isMyTurn: boolean;
  lastMove?: { from: Position; to: Position } | null;
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
  const [validMoves, setValidMoves] = useState<Position[]>([]);

  // ゲーム状態が変わったら選択をリセット
  useEffect(() => {
    setSelected(null);
    setValidMoves([]);
  }, [gameState.currentTurn]);

  const handleClick = (row: number, col: number) => {
    if (!isMyTurn || gameState.status !== 'playing') return;
    const clickPos = { row, col };

    // 有効な移動先をクリックした場合
    if (selected && validMoves.some((m) => posEqual(m, clickPos))) {
      if (selected.type === 'tanuki' && onTanukiMove) {
        onTanukiMove(clickPos);
      } else if (selected.type === 'fox' && onFoxMove) {
        onFoxMove(selected.index, clickPos);
      }
      setSelected(null);
      setValidMoves([]);
      return;
    }

    // タヌキを選択
    if (playerSide === 'tanuki' && gameState.currentTurn === 'tanuki') {
      if (posEqual(gameState.tanukiPos, clickPos)) {
        setSelected({ type: 'tanuki' });
        setValidMoves(getTanukiMoves(gameState));
        return;
      }
    }

    // キツネを選択
    if (playerSide === 'fox' && gameState.currentTurn === 'fox') {
      const foxIdx = gameState.foxPositions.findIndex((f) =>
        posEqual(f, clickPos)
      );
      if (foxIdx !== -1) {
        setSelected({ type: 'fox', index: foxIdx });
        setValidMoves(getFoxMoves(gameState, foxIdx));
        return;
      }
    }

    // 選択解除
    setSelected(null);
    setValidMoves([]);
  };

  const getCellClass = (row: number, col: number): string => {
    const isPlayableSquare = (row + col) % 2 === 1;
    const pos = { row, col };
    const isValidMove = validMoves.some((m) => posEqual(m, pos));
    const isTanuki = posEqual(gameState.tanukiPos, pos);
    const foxIdx = gameState.foxPositions.findIndex((f) => posEqual(f, pos));
    const isFox = foxIdx !== -1;
    const isLastFrom = lastMove && posEqual(lastMove.from, pos);
    const isLastTo = lastMove && posEqual(lastMove.to, pos);
    const isSelected =
      selected &&
      ((selected.type === 'tanuki' && isTanuki) ||
        (selected.type === 'fox' && isFox && selected.index === foxIdx));

    let base = 'relative flex items-center justify-center cursor-pointer transition-all duration-150 select-none ';

    if (!isPlayableSquare) {
      base += 'bg-amber-100 ';
    } else {
      base += 'bg-green-900 ';
    }

    if (isSelected) base += 'ring-4 ring-inset ring-yellow-300 ';
    if (isValidMove && isPlayableSquare) base += 'ring-2 ring-inset ring-sky-400 ';
    if (isLastFrom && isPlayableSquare) base += 'bg-green-800 ';
    if (isLastTo && isPlayableSquare) base += 'bg-green-700 ';

    return base;
  };

  const cells = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const pos = { row, col };
      const isPlayableSquare = (row + col) % 2 === 1;
      const isTanuki = posEqual(gameState.tanukiPos, pos);
      const foxIdx = gameState.foxPositions.findIndex((f) => posEqual(f, pos));
      const isFox = foxIdx !== -1;
      const isValidMove = validMoves.some((m) => posEqual(m, pos));
      const isSelected =
        selected &&
        ((selected.type === 'tanuki' && isTanuki) ||
          (selected.type === 'fox' && isFox && selected.index === foxIdx));

      cells.push(
        <div
          key={`${row}-${col}`}
          className={getCellClass(row, col)}
          style={{ width: '12.5%', aspectRatio: '1' }}
          onClick={() => handleClick(row, col)}
        >
          {isTanuki && (
            <span
              className={`text-4xl sm:text-5xl leading-none z-10 transition-transform duration-200 ${
                isSelected ? 'scale-110' : 'hover:scale-105'
              } ${isMyTurn && playerSide === 'tanuki' && gameState.currentTurn === 'tanuki' ? 'cursor-pointer' : ''}`}
              title="タヌキ"
            >
              🦝
            </span>
          )}
          {isFox && (
            <span
              className={`text-4xl sm:text-5xl leading-none z-10 transition-transform duration-200 ${
                isSelected ? 'scale-110' : 'hover:scale-105'
              } ${isMyTurn && playerSide === 'fox' && gameState.currentTurn === 'fox' ? 'cursor-pointer' : ''}`}
              title={`キツネ ${foxIdx + 1}`}
            >
              🦊
            </span>
          )}
          {isValidMove && !isTanuki && !isFox && isPlayableSquare && (
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-sky-400 opacity-70 z-10" />
          )}
          {isValidMove && (isTanuki || isFox) && (
            <div className="absolute inset-0 ring-2 ring-sky-400 ring-inset opacity-70 z-20" />
          )}
        </div>
      );
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* 上端ラベル (キツネのゴール側) */}
      <div className="flex justify-between px-1 mb-1 text-xs text-gray-400 font-mono">
        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((c) => (
          <span key={c} className="w-[12.5%] text-center">{c}</span>
        ))}
      </div>
      <div
        className="grid border-2 border-amber-800 shadow-2xl"
        style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}
      >
        {cells}
      </div>
      {/* 下端ラベル */}
      <div className="flex justify-between px-1 mt-1 text-xs text-gray-400 font-mono">
        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((c) => (
          <span key={c} className="w-[12.5%] text-center">{c}</span>
        ))}
      </div>
    </div>
  );
}
