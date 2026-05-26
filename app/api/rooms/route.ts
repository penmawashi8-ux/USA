import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createInitialState } from '@/lib/gameLogic';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// POST /api/rooms  body: { action: 'create', side: 'tanuki'|'fox', sessionId: string }
//                  body: { action: 'join', code: string, sessionId: string }
export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Supabase が設定されていません。.env.local を確認してください。' },
      { status: 503 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const body = await req.json();
  const { action, sessionId } = body;

  if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 });

  if (action === 'create') {
    const { side } = body as { side: 'tanuki' | 'fox'; action: string; sessionId: string };
    let code = generateCode();
    const gameState = createInitialState();

    // コード衝突を避けるために最大3回試行
    for (let i = 0; i < 3; i++) {
      const { error } = await supabase.from('rooms').insert({
        id: code,
        game_state: JSON.stringify(gameState),
        player_tanuki: side === 'tanuki' ? sessionId : null,
        player_fox: side === 'fox' ? sessionId : null,
        status: 'waiting',
      });
      if (!error) break;
      code = generateCode();
    }

    return NextResponse.json({ code });
  }

  if (action === 'join') {
    const { code } = body as { code: string; action: string; sessionId: string };
    const { data: room, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', code.toUpperCase())
      .single();

    if (error || !room) {
      return NextResponse.json({ error: '部屋が見つかりません' }, { status: 404 });
    }
    if (room.status !== 'waiting') {
      return NextResponse.json({ error: 'この部屋は満員または終了済みです' }, { status: 400 });
    }

    const isPlayerTanuki = room.player_tanuki === sessionId;
    const isPlayerFox = room.player_fox === sessionId;

    // すでに参加済みの場合はそのまま返す
    if (isPlayerTanuki || isPlayerFox) {
      return NextResponse.json({
        code: room.id,
        side: isPlayerTanuki ? 'tanuki' : 'fox',
        status: room.status,
      });
    }

    // 空いているスロットに参加
    const updates: Record<string, string> = { status: 'playing' };
    let joinedSide: 'tanuki' | 'fox';
    if (!room.player_tanuki) {
      updates.player_tanuki = sessionId;
      joinedSide = 'tanuki';
    } else if (!room.player_fox) {
      updates.player_fox = sessionId;
      joinedSide = 'fox';
    } else {
      return NextResponse.json({ error: 'この部屋は満員です' }, { status: 400 });
    }

    await supabase.from('rooms').update(updates).eq('id', room.id);
    return NextResponse.json({ code: room.id, side: joinedSide, status: 'playing' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
