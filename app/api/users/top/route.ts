import { getRedis, REDIS_HASH_OWNERS, REDIS_HASH_USERS } from '@/lib/redis';
import appConfig from "@/appConfig";

export const runtime = 'nodejs';

const TOTAL_PIXELS = appConfig.canvas.width * appConfig.canvas.height;

export async function GET() {
  try {
    const r = await getRedis();
    const limit = 1000000; // scan up to full canvas size
    let cursor = 0;
    let seen = 0;
    const counts = new Map<string, number>();
    do {
      const { cursor: nextCursor, tuples } = await r.hScan(REDIS_HASH_OWNERS, cursor, { COUNT: 1000 });
      cursor = Number(nextCursor);
      for (const { value: owner } of tuples) {
        if (!owner) continue;
        const key = owner as string;
        counts.set(key, (counts.get(key) || 0) + 1);
        seen++;
        if (seen >= limit) {
          cursor = 0;
          break;
        }
      }
    } while (cursor !== 0);
    const entries = Array.from(counts.entries()).map(([userId, count]) => ({ userId, count }));
    entries.sort((a, b) => b.count - a.count);
    const top = entries.slice(0, 3);
    const ids = top.map(t => t.userId);
    const names: Record<string, string> = {};
    if (ids.length) {
      const vals = await r.hmGet(REDIS_HASH_USERS, ids);
      ids.forEach((id, i) => (names[id] = (vals[i] as string | null) || id.substring(0, 6)));
    }
    const users = top.map(t => ({ id: t.userId, name: names[t.userId], count: t.count, percentage: TOTAL_PIXELS ? (t.count / TOTAL_PIXELS) : 0 }));
    return Response.json({ users } as const);
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
