# 🦝 タヌキ vs キツネ

古典ボードゲーム「Fox and Hounds」をベースにしたWebゲーム。  
1匹のタヌキが4匹のキツネから逃げ切れるか？

## ゲームルール

- **タヌキ (1匹)**: 斜め4方向に移動可能。上端に到達すれば勝ち
- **キツネ (4匹)**: 前方 (下方向) のみ移動可能。タヌキを動けなくすれば勝ち
- **必勝法**: キツネ側は正しく動かせば必ず勝てる (数学的に証明済み)

## 機能

- 💻 **CPU対戦**: 弱い/普通/強い の3段階
- 🌐 **オンライン対戦**: 部屋コードで友達と対戦 (Supabase使用)
- タヌキ側・キツネ側どちらでもプレイ可能

## セットアップ

### CPU対戦のみ (Supabase不要)

```bash
npm install
npm run dev
```

### オンライン対戦も使う場合

1. [Supabase](https://supabase.com) で無料アカウントを作成
2. 新しいプロジェクトを作成
3. SQL Editor で `supabase-schema.sql` の内容を実行
4. `.env.local.example` を `.env.local` にコピーして設定:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

5. 開発サーバー起動:

```bash
npm run dev
```

## Vercel へのデプロイ

1. GitHub に push
2. [Vercel](https://vercel.com) でインポート
3. Environment Variables に Supabase の URL と Anon Key を設定
4. デプロイ完了 🎉

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript
- **スタイル**: Tailwind CSS
- **オンライン対戦**: Supabase (PostgreSQL + Realtime)
- **ホスティング**: Vercel (無料)
- **AI**: ミニマックス法 + アルファベータ剪定 (深さ9)
