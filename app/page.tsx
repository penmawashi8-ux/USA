import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <div className="text-center space-y-3">
        <div className="text-7xl mb-4">🦝🆚🦊</div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
          タヌキ <span className="text-gray-500">vs</span> キツネ
        </h1>
        <p className="text-gray-400 max-w-md text-sm sm:text-base">
          1匹のタヌキが3匹のキツネから逃げ切れるか？<br />
          「うさぎと猟犬」をベースにした戦略ボードゲーム
        </p>
      </div>

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

      <div className="w-full max-w-md bg-green-950/50 border border-green-900 rounded-xl p-5 space-y-3">
        <h2 className="font-bold text-green-400">📜 ゲームルール</h2>

        {/* ミニボード図 */}
        <div className="text-xs text-gray-500 font-mono text-center bg-[#1a2f10] rounded-lg p-3 leading-relaxed">
          <div>A —— B —— C</div>
          <div>|╲ ╱ ╲ | ╱ ╲╱ |</div>
          <div>E —— F —— G —— H ← タヌキ</div>
          <div>|╱ ╲ ╱ | ╲ ╱╲ |</div>
          <div>I —— J —— K</div>
          <div className="mt-1">↑ キツネ×3 スタート (A, E, I)</div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <div className="font-bold">🦝 タヌキ側</div>
            <ul className="text-gray-400 space-y-1 text-xs">
              <li>• 任意の隣接ノードに移動</li>
              <li>• キツネ全員の左側に出れば勝ち</li>
              <li>• 動けなくなったら負け</li>
            </ul>
          </div>
          <div className="space-y-1">
            <div className="font-bold">🦊 キツネ側</div>
            <ul className="text-gray-400 space-y-1 text-xs">
              <li>• 前進 (右方向) のみ移動可</li>
              <li>• タヌキを動けなくしたら勝ち</li>
              <li>• 先手はキツネ</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-yellow-600">
          ⚠️ キツネ側に必勝法あり。CPU (強い) はほぼ必ず勝ちます
        </p>
      </div>
    </div>
  );
}
