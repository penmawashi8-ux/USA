-- タヌキ vs キツネ - Supabase スキーマ
-- このファイルを Supabase の SQL Editor で実行してください
-- https://app.supabase.com → プロジェクト選択 → SQL Editor

-- ゲームルーム テーブル
create table if not exists rooms (
  id text primary key,                    -- 6文字の部屋コード
  game_state text not null,               -- JSON: GameState
  player_tanuki text,                     -- セッションID (タヌキ側プレイヤー)
  player_fox text,                        -- セッションID (キツネ側プレイヤー)
  status text not null default 'waiting', -- waiting | playing | finished
  created_at timestamptz not null default now()
);

-- RLS (Row Level Security) を有効化
alter table rooms enable row level security;

-- 全員が読み取り可能
create policy "Anyone can read rooms"
  on rooms for select
  using (true);

-- 全員が作成可能
create policy "Anyone can create rooms"
  on rooms for insert
  with check (true);

-- 全員が更新可能 (認証なし簡易実装)
create policy "Anyone can update rooms"
  on rooms for update
  using (true);

-- 古いルームを自動削除 (24時間後)
-- ※ Supabase の pg_cron 拡張が必要な場合は手動で設定
-- select cron.schedule('cleanup-old-rooms', '0 * * * *', $$
--   delete from rooms where created_at < now() - interval '24 hours';
-- $$);

-- Realtime を有効化
alter publication supabase_realtime add table rooms;
