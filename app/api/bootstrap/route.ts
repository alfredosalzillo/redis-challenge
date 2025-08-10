import { getRedis, REDIS_HASH_COLORS } from '@/lib/redis';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const r = await getRedis();
    const limit = 50000;
    let cursor = 0;
    const entries: Record<string, string> = {};
    let seen = 0;
    do {
      const { cursor: nextCursor, tuples } = await r.hScan(REDIS_HASH_COLORS, cursor, { COUNT: 1000 });
      cursor = Number(nextCursor);
      for (const { field, value } of tuples) {
        entries[field] = value as string;
        seen++;
        if (seen >= limit) {
          cursor = 0;
          break;
        }
      }
    } while (cursor !== 0);
    return Response.json({ colors: entries } as const);
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
