import { NextRequest } from 'next/server';
import { getRedis, REDIS_CHANNEL_CANVAS, REDIS_HASH_COLORS, REDIS_HASH_OWNERS, REDIS_STREAM_CANVAS } from '@/lib/redis';

import { idxFromXY } from "@/lib/idx";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { x, y, color, userId } = body || {} as { x: number; y: number; color: string; userId?: string };
    if (typeof x !== 'number' || typeof y !== 'number' || typeof color !== 'string') {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }
    if (x < 0 || y < 0 || x >= 1000 || y >= 1000) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const norm = color.startsWith('#') ? color.toLowerCase() : `#${color.toLowerCase()}`;
    const idx = idxFromXY(x, y);
    const at = Date.now();

    const r = await getRedis();
    await r.hSet(REDIS_HASH_COLORS, idx.toString(), norm);
    if (userId) {
      await r.hSet(REDIS_HASH_OWNERS, idx.toString(), userId);
    }
    const msg = JSON.stringify({ x, y, idx, color: norm, userId, at });
    await Promise.all([
      r.publish(REDIS_CHANNEL_CANVAS, msg),
      r.xAdd(REDIS_STREAM_CANVAS, '*', { x: x.toString(), y: y.toString(), idx: idx.toString(), color: norm, at: at.toString(), userId: userId || '' })
    ]);
    return Response.json({ ok: true as const });
  } catch (e) {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
