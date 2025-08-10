import { getRedis, REDIS_HASH_USERS, REDIS_ZSET_ONLINE } from '@/lib/redis';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const r = await getRedis();
    const now = Date.now();
    const cutoff = now - 30000;
    await r.zRemRangeByScore(REDIS_ZSET_ONLINE, 0, cutoff);
    const ids = await r.zRange(REDIS_ZSET_ONLINE, 0, -1);
    const names: Record<string, string> = {};
    if (ids.length) {
      const vals = await r.hmGet(REDIS_HASH_USERS, ids);
      ids.forEach((id, i) => (names[id] = (vals[i] as string | null) || id.substring(0, 6)));
    }
    const users = ids.map((id) => ({ id, name: names[id] }));
    return Response.json({ users } as const);
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
