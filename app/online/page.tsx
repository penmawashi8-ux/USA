'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionId } from '@/lib/supabase';
import { Side } from '@/lib/gameLogic';

export default function OnlinePage() {
  const router = useRouter();
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [side, setSide] = useState<Side>('tanuki');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const createRoom = async () => {
    setLoading(true);
    setError('');
    try {
      const sessionId = getSessionId();
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', side, sessionId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      router.push(`/online/${data.code}?side=${side}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '部屋の作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!joinCode.trim()) {
      setError('部屋コードを入力してください');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const sessionId = getSessionId();
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', code: joinCode.trim().toUpperCase(), sessionId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      router.push(`/online/${data.code}?side=${data.side}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '参加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'menu') {
    return (
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-1">🌐 オンライン対戦</h1>
          <p className="text-gray-400 text-sm">友達とリアルタイムで対戦しよう</p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => setMode('create')}
            className="p-5 bg-green-950 border-2 border-green-800 hover:border-green-500 rounded-xl transition-all hover:scale-105 text-center"
          >
            <div className="text-3xl mb-2">🏠</div>
            <div className="font-bold">部屋を作る</div>
            <div className="text-xs text-gray-400 mt-1">コードを友達に送る</div>
          </button>
          <button
            onClick={() => setMode('join')}
            className="p-5 bg-green-950 border-2 border-green-800 hover:border-green-500 rounded-xl transition-all hover:scale-105 text-center"
          >
            <div className="text-3xl mb-2">🚪</div>
            <div className="font-bold">部屋に入る</div>
            <div className="text-xs text-gray-400 mt-1">友達のコードで参加</div>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-1">🏠 部屋を作る</h1>
          <p className="text-gray-400 text-sm">プレイするサイドを選んでください</p>
        </div>

        <div className="w-full max-w-xs space-y-5">
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
              </button>
            ))}
          </div>

          <p className="text-xs text-gray-500 text-center">
            友達は自動的に{side === 'tanuki' ? 'キツネ' : 'タヌキ'}側になります
          </p>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            onClick={createRoom}
            disabled={loading}
            className="w-full py-3 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-white rounded-xl font-bold transition-all"
          >
            {loading ? '作成中…' : '部屋を作る'}
          </button>
          <button
            onClick={() => setMode('menu')}
            className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← 戻る
          </button>
        </div>
      </div>
    );
  }

  // join mode
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-1">🚪 部屋に入る</h1>
        <p className="text-gray-400 text-sm">友達からもらったコードを入力</p>
      </div>

      <div className="w-full max-w-xs space-y-4">
        <input
          type="text"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="6桁のコード (例: AB3XY7)"
          maxLength={6}
          className="w-full px-4 py-3 bg-green-950 border-2 border-green-800 focus:border-green-500 rounded-xl text-center text-xl font-mono font-bold tracking-widest outline-none transition-colors"
        />

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          onClick={joinRoom}
          disabled={loading || joinCode.length < 6}
          className="w-full py-3 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-white rounded-xl font-bold transition-all"
        >
          {loading ? '参加中…' : '参加する'}
        </button>
        <button
          onClick={() => setMode('menu')}
          className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          ← 戻る
        </button>
      </div>
    </div>
  );
}
