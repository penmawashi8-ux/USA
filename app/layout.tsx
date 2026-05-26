import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';

const notoSansJP = Noto_Sans_JP({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'タヌキ vs キツネ | ボードゲーム',
  description: 'タヌキが4匹のキツネから逃げ切れるか？古典ボードゲーム「Fox and Hounds」をベースにしたWebゲーム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={notoSansJP.className}>
      <body className="bg-[#0f1a0a] text-[#e8f0e3] min-h-screen">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-green-900 py-3 px-4">
            <a href="/" className="text-lg font-bold hover:text-green-400 transition-colors">
              🦝 タヌキ vs キツネ 🦊
            </a>
          </header>
          <main className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
            {children}
          </main>
          <footer className="border-t border-green-900 py-3 px-4 text-center text-xs text-gray-600">
            Fox and Hounds ベースの戦略ボードゲーム
          </footer>
        </div>
      </body>
    </html>
  );
}
