'use client';

import { useState, useEffect, useCallback } from 'react';
import Board from '@/components/Board';
import GameInfo, { TurnIndicator } from '@/components/GameInfo';
import {
  GameState,
  Side,
  Difficulty,
  Position,
  createInitialState,
  applyTanukiMove,
  applyFoxMove,
} from '@/lib/gameLogic';
import { getAIMove } from '@/lib/ai';

type SetupState = { phase: 'setup' } | { phase: 'playing'; side: Side; difficulty: Difficulty };

const DIFFICULTY_LABELS: Record<Difficulty, { label: string; desc: string; emoji: string }> = {
  easy: { label: '弱い', desc: 'ランダムに動く', emoji: '🌱' },
  medium: { label: '普通', desc: 'そこそこ考える', emoji: '🌿' },
  hard: { label: '強い', desc: '必勝法を使う', emoji: '🌳' },
};

export default function CpuPage() {
  const [setup, setSetup] = useState<SetupState>({ phase: 'setup' });
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const startGame = (side: Side, difficulty: Difficulty) => {
    setSetup({ phase: 'playing', side, difficulty });
    setGameState(createInitialState());
    setLastMove(null);
  };

  const restart = () => {
    setSetup({ phase: 'setup' });
    setLastMove(null);
  };

  const handleTanukiMove = useCallback(
    (to: Position) => {
      if (setup.phase !== 'playing') return;
      setGameState((prev) => {
        const from = prev.tanukiPos;
        const next = applyTanukiMove(prev, to);
        setLastMove({ from, to });
        return next;
      });
    },
    [setup]
  );

  const handleFoxMove = useCallback(
    (foxIndex: number, to: Position) => {
      if (setup.phase !== 'playing') return;
      setGameState((prev) => {
        const from = prev.foxPositions[foxIndex];
        const next = applyFoxMove(prev, foxIndex, to);
        setLastMove({ from, to });
        return next;
      });
    },
    [setup]
  );

  // CPU の手番処理
  useEffect(() => {
    if (setup.phase !== 'playing') return;
    if (gameState.status !== 'playing') return;

    const isPlayerTurn = gameState.currentTurn === setup.side;
    if (isPlayerTurn) return;

    setIsThinking(true);
    // わずかに遅延させてCPUが「考えている」感を出す
    const delay = setup.difficulty === 'hard' ? 600 : 300;
    const timer = setTimeout(() => {
      const move = getAIMove(gameState, setup.difficulty);
      if (!move) return;
      if (move.type === 'tanuki') {
        setLastMove({ from: gameState.tanukiPos, to: move.to });
        setGameState((prev) => applyTanukiMove(prev, move.to));
      } else {
        const from = gameState.foxPositions[move.foxIndex];
        setLastMove({ from, to: move.to });
        setGameState((prev) => applyFoxMove(prev, move.foxIndex, move.to));
      }
      setIsThinking(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [gameState, setup]);

  if (setup.phase === 'setup') {
    return (
      <div className="flex flex-col items-center gap-8 py-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-1">💻 CPU 対戦</h1>
          <p className="text-gray-400 text-sm">どちら側でプレイしますか？</p>
        </div>

        {/* サイド選択 */}
        <div className="w-full max-w-sm space-y-3">
          <h2 className="text-sm text-gray-400 font-medium">プレイするサイドを選択</h2>
          <SideSelector onStart={startGame} />
        </div>
      </div>
    );
  }

  const { side, difficulty } = setup;
  const isMyTurn = gameState.currentTurn === side;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={restart}
          className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          ← 戻る
        </button>
        <TurnIndicator currentTurn={gameState.currentTurn} isMyTurn={isMyTurn} />
        <div className="text-sm text-gray-400">
          {isThinking && <span className="animate-pulse">🤔 考え中…</span>}
        </div>
      </div>

      <Board
        gameState={gameState}
        playerSide={side}
        onTanukiMove={side === 'tanuki' ? handleTanukiMove : undefined}
        onFoxMove={side === 'fox' ? handleFoxMove : undefined}
        isMyTurn={isMyTurn && !isThinking}
        lastMove={lastMove}
      />

      <GameInfo
        gameState={gameState}
        playerSide={side}
        difficulty={difficulty}
        opponentType="cpu"
        isMyTurn={isMyTurn && !isThinking}
        onRestart={restart}
      />
    </div>
  );
}

function SideSelector({ onStart }: { onStart: (side: Side, difficulty: Difficulty) => void }) {
  const [side, setSide] = useState<Side | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  return (
    <div className="space-y-5">
      {/* サイド選択 */}
      <div className="grid grid-cols-2 gap-3">
        {(['tanuki', 'fox'] as Side[]).map((s) => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={`p-4 rounded-xl border-2 transition-all ${
              side === s
                ? 'border-green-500 bg-green-900/50 scale-105'
                : 'border-green-900 hover:border-green-700'
            }`}
          >
            <div className="text-3xl mb-1">{s === 'tanuki' ? '🦝' : '🦊'}</div>
            <div className="font-bold text-sm">{s === 'tanuki' ? 'タヌキ' : 'キツネ×4'}</div>
            <div className="text-xs text-gray-400 mt-1">
              {s === 'tanuki' ? '逃げ切れ！' : '包囲しろ！'}
            </div>
          </button>
        ))}
      </div>

      {/* 難易度選択 */}
      {side && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <h3 className="text-sm text-gray-400">CPU の強さ</h3>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(DIFFICULTY_LABELS) as [Difficulty, typeof DIFFICULTY_LABELS[Difficulty]][]).map(
              ([d, info]) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    difficulty === d
                      ? 'border-green-500 bg-green-900/50 scale-105'
                      : 'border-green-900 hover:border-green-700'
                  }`}
                >
                  <div className="text-2xl">{info.emoji}</div>
                  <div className="font-bold text-xs mt-1">{info.label}</div>
                  <div className="text-xs text-gray-500">{info.desc}</div>
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* スタートボタン */}
      {side && difficulty && (
        <button
          onClick={() => onStart(side, difficulty)}
          className="w-full py-3 bg-green-700 hover:bg-green-600 text-white rounded-xl font-bold text-lg transition-all hover:scale-105 animate-in fade-in duration-200"
        >
          ゲームスタート！
        </button>
      )}
    </div>
  );
}
