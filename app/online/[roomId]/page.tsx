'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Board from '@/components/Board';
import GameInfo, { TurnIndicator } from '@/components/GameInfo';
import { supabase, getSessionId } from '@/lib/supabase';
import {
  GameState,
  Side,
  Position,
  createInitialState,
  applyTanukiMove,
  applyFoxMove,
} from '@/lib/gameLogic';

type RoomStatus = 'waiting' | 'playing' | 'finished';

export default function OnlineRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = (params.roomId as string).toUpperCase();
  const sideParam = searchParams.get('side') as Side | null;

  const [playerSide, setPlayerSide] = useState<Side>(sideParam ?? 'tanuki');
  const [roomStatus, setRoomStatus] = useState<RoomStatus>('waiting');
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
  const [copied, setCopied] = useState(false);
  const sessionId = useRef(getSessionId());

  // Supabase からルームデータを取得
  const fetchRoom = useCallback(async () => {
    const { data } = await supabase.from('rooms').select('*').eq('id', roomId).single();
    if (!data) return;

    setRoomStatus(data.status as RoomStatus);
    if (data.game_state) {
      try {
        setGameState(JSON.parse(data.game_state));
      } catch {
        // ignore parse errors
      }
    }

    // 自分のサイドを確認
    if (data.player_tanuki === sessionId.current) setPlayerSide('tanuki');
    else if (data.player_fox === sessionId.current) setPlayerSide('fox');
  }, [roomId]);

  // Supabase Realtime でルームの変更を購読
  useEffect(() => {
    fetchRoom();

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          const row = payload.new as {
            status: RoomStatus;
            game_state: string;
            player_tanuki: string | null;
            player_fox: string | null;
          };
          setRoomStatus(row.status);
          if (row.game_state) {
            try {
              setGameState(JSON.parse(row.game_state));
            } catch {
              // ignore
            }
          }
          if (row.player_tanuki === sessionId.current) setPlayerSide('tanuki');
          else if (row.player_fox === sessionId.current) setPlayerSide('fox');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, fetchRoom]);

  // 手を Supabase に保存
  const saveMove = useCallback(
    async (newState: GameState) => {
      await supabase
        .from('rooms')
        .update({
          game_state: JSON.stringify(newState),
          status: newState.status !== 'playing' ? 'finished' : 'playing',
        })
        .eq('id', roomId);
    },
    [roomId]
  );

  const handleTanukiMove = useCallback(
    async (to: Position) => {
      if (playerSide !== 'tanuki' || gameState.currentTurn !== 'tanuki') return;
      const from = gameState.tanukiPos;
      const next = applyTanukiMove(gameState, to);
      setGameState(next);
      setLastMove({ from, to });
      await saveMove(next);
    },
    [gameState, playerSide, saveMove]
  );

  const handleFoxMove = useCallback(
    async (foxIndex: number, to: Position) => {
      if (playerSide !== 'fox' || gameState.currentTurn !== 'fox') return;
      const from = gameState.foxPositions[foxIndex];
      const next = applyFoxMove(gameState, foxIndex, to);
      setGameState(next);
      setLastMove({ from, to });
      await saveMove(next);
    },
    [gameState, playerSide, saveMove]
  );

  const copyCode = () => {
    navigator.clipboard.writeText(roomId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isMyTurn = gameState.currentTurn === playerSide;

  if (roomStatus === 'waiting') {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">🕐 対戦相手を待っています…</h1>
          <p className="text-gray-400 text-sm">以下のコードを友達に送ってください</p>
        </div>

        <div className="bg-green-950 border-2 border-green-700 rounded-2xl p-6 text-center space-y-3">
          <p className="text-gray-400 text-sm">部屋コード</p>
          <p className="text-5xl font-black font-mono tracking-widest text-green-300">{roomId}</p>
          <button
            onClick={copyCode}
            className="px-4 py-2 bg-green-800 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
          >
            {copied ? '✅ コピーしました' : '📋 コピーする'}
          </button>
        </div>

        <div className="text-center space-y-1">
          <p className="text-gray-400 text-sm">あなたのサイド</p>
          <p className="text-2xl font-bold">
            {playerSide === 'tanuki' ? '🦝 タヌキ (逃げる側)' : '🦊 キツネ×4 (追う側)'}
          </p>
        </div>

        <div className="animate-pulse text-gray-600 text-sm">接続を待っています…</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-600 font-mono">部屋: {roomId}</div>
        <TurnIndicator currentTurn={gameState.currentTurn} isMyTurn={isMyTurn} />
        <div className="text-xs text-gray-600">
          {isMyTurn ? (
            <span className="text-green-400 font-bold">あなたの番</span>
          ) : (
            <span className="animate-pulse">相手の番…</span>
          )}
        </div>
      </div>

      <Board
        gameState={gameState}
        playerSide={playerSide}
        onTanukiMove={playerSide === 'tanuki' ? handleTanukiMove : undefined}
        onFoxMove={playerSide === 'fox' ? handleFoxMove : undefined}
        isMyTurn={isMyTurn}
        lastMove={lastMove}
      />

      <GameInfo
        gameState={gameState}
        playerSide={playerSide}
        opponentType="online"
        isMyTurn={isMyTurn}
        onRestart={() => (window.location.href = '/online')}
      />
    </div>
  );
}
