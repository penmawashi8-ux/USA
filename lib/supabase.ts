import { createClient } from '@supabase/supabase-js';

// 未設定時はプレースホルダーを使用 (オンライン機能は動作しないが、ビルドは成功する)
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key_not_configured';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type RoomStatus = 'waiting' | 'playing' | 'finished';

export interface RoomRow {
  id: string;
  game_state: string;
  player_tanuki: string | null;
  player_fox: string | null;
  status: RoomStatus;
  created_at: string;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('tanuki_session_id');
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('tanuki_session_id', id);
  }
  return id;
}
