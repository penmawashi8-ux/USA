import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      {/* タイトル */}
      <div className="text-center space-y-3">
        <div className="text-7xl mb-4">🦝🆚🦊</div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
          タヌキ <span className="text-gray-500">vs</span> キツネ
        </h1>
        <p className="text-gray-400 max-w-md text-sm sm:text-base">
          1匹のタヌキが4匹のキツネから逃げ切れるか？<br />
          古典ボードゲーム「Fox &amp; Hounds」をベースにした戦略ゲーム
        </p>
      </div>

      {/* ゲームモード選択 */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Link
          href="/cpu"
          className="flex-1 flex flex-col items-center gap-2 p-6 bg-green-950 border-2 border-green-800 hover:border-green-500 rounded-2xl transition-all hover:scale-105 hover:bg-green-900"
        >
          <span className="text-4xl">💻</span>
          <span className="text-xl font-bold">CPU 対戦</span>
          <span className="text-xs text-gray-400 text-center">強さを選んで一人で遊ぶ</span>
        </Link>
        <Link
          href="/online"
          className="flex-1 flex flex-col items-center gap-2 p-6 bg-green-950 border-2 border-green-800 hover:border-green-500 rounded-2xl transition-all hover:scale-105 hover:bg-green-900"
        >
          <span className="text-4xl">🌐</span>
          <span className="text-xl font-bold">オンライン対戦</span>
          <span className="text-xs text-gray-400 text-center">友達とリアルタイム対戦</span>
        </Link>
      </div>

      {/* ゲームルール説明 */}
      <div className="w-full max-w-md bg-green-950/50 border border-green-900 rounded-xl p-5 space-y-3">
        <h2 className="font-bold text-green-400">📜 ゲームルール</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1 font-bold">🦝 タヌキ側</div>
            <ul className="text-gray-400 space-y-1 text-xs">
              <li>• 斜め4方向に移動可能</li>
              <li>• 上端 (一番上の列) に到達で勝ち</li>
              <li>• 動けなくなったら負け</li>
            </ul>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 font-bold">🦊 キツネ側</div>
            <ul className="text-gray-400 space-y-1 text-xs">
              <li>• 斜め前方 (下方向) のみ移動</li>
              <li>• タヌキを動けなくしたら勝ち</li>
              <li>• 4匹で連携が重要</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-yellow-600 mt-2">
          ⚠️ このゲームはキツネ側に必勝法があります。CPU (強い) はほぼ必ず勝ちます
        </p>
      </div>
    </div>
  );
}
