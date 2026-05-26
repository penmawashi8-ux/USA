'use client';

import { GameState, Player, Side, Difficulty } from '@/lib/gameLogic';

interface GameInfoProps {
  gameState: GameState;
  playerSide: Side;
  difficulty?: Difficulty;
  opponentType: 'cpu' | 'online';
  isMyTurn: boolean;
  onRestart?: () => void;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '弱い',
  medium: '普通',
  hard: '強い',
};

export default function GameInfo({
  gameState,
  playerSide,
  difficulty,
  opponentType,
  isMyTurn,
  onRestart,
}: GameInfoProps) {
  const { status, currentTurn } = gameState;
  const isPlaying = status === 'playing';

  const statusMessage = () => {
    if (status === 'tanuki_wins') {
      return playerSide === 'tanuki' ? '🎉 タヌキの勝ち！包囲網を突破！' : '😭 タヌキに逃げられた…キツネの負け';
    }
    if (status === 'fox_wins') {
      return playerSide === 'fox' ? '🎉 キツネの勝ち！タヌキを囲い込んだ！' : '😭 キツネに囲まれた…タヌキの負け';
    }
    if (currentTurn === 'tanuki') {
      return isMyTurn ? '🦝 あなたの番 (タヌキ)' : '🦝 タヌキの番…';
    }
    return isMyTurn ? '🦊 あなたの番 (キツネ)' : '🦊 キツネの番…';
  };

  const statusColor = () => {
    if (status === 'tanuki_wins') return playerSide === 'tanuki' ? 'text-yellow-400' : 'text-red-400';
    if (status === 'fox_wins') return playerSide === 'fox' ? 'text-yellow-400' : 'text-red-400';
    return isMyTurn ? 'text-green-400' : 'text-gray-400';
  };

  return (
    <div className="bg-[#1a2f10] border border-green-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">あなた:</span>
          <span className="font-bold">
            {playerSide === 'tanuki' ? '🦝 タヌキ' : '🦊 キツネ×3'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">対戦:</span>
          <span className="font-bold">
            {opponentType === 'cpu'
              ? `💻 CPU (${difficulty ? DIFFICULTY_LABELS[difficulty] : ''})`
              : '🌐 オンライン'}
          </span>
        </div>
      </div>

      <div className={`text-center text-lg font-bold ${statusColor()}`}>
        {statusMessage()}
      </div>

      {isPlaying && (
        <div className="text-xs text-gray-500 text-center">
          {playerSide === 'tanuki'
            ? '🦝 キツネ3匹の左側に抜け出せば勝ち！'
            : '🦊 タヌキを囲んで動けなくしろ！前進のみ可能'}
        </div>
      )}

      {!isPlaying && onRestart && (
        <button
          onClick={onRestart}
          className="w-full py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg font-bold transition-colors"
        >
          もう一度遊ぶ
        </button>
      )}
    </div>
  );
}

export function TurnIndicator({ currentTurn, isMyTurn }: { currentTurn: Player; isMyTurn: boolean }) {
  return (
    <div className="flex items-center justify-center gap-3 text-sm">
      <div
        className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
          currentTurn === 'tanuki'
            ? 'bg-amber-700 text-white font-bold scale-105'
            : 'bg-gray-800 text-gray-400'
        }`}
      >
        <span>🦝</span>
        <span>タヌキ</span>
      </div>
      <span className="text-gray-500">vs</span>
      <div
        className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
          currentTurn === 'fox'
            ? 'bg-orange-700 text-white font-bold scale-105'
            : 'bg-gray-800 text-gray-400'
        }`}
      >
        <span>🦊</span>
        <span>キツネ</span>
      </div>
    </div>
  );
}
