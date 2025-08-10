import { NextRequest } from 'next/server';
import { getRedis, REDIS_HASH_USERS, REDIS_ZSET_ONLINE } from '@/lib/redis';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId, name } = await req.json();
    if (!userId || typeof userId !== 'string') {
      return Response.json({ error: 'userId required' }, { status: 400 });
    }
    const r = await getRedis();
    const now = Date.now();
    if (name && typeof name === 'string') await r.hSet(REDIS_HASH_USERS, userId, name);
    await r.zAdd(REDIS_ZSET_ONLINE, [{ score: now, value: userId }]);
    return Response.json({ ok: true as const, at: now });
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
