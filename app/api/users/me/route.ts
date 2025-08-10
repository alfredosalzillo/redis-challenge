import { NextRequest } from 'next/server';
import { getRedis, REDIS_HASH_OWNERS, REDIS_HASH_USERS } from '@/lib/redis';
import appConfig from "@/appConfig";

export const runtime = 'nodejs';

const TOTAL_PIXELS = appConfig.canvas.width * appConfig.canvas.height;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');
    if (!userId) {
      return Response.json({ error: 'userId required' }, { status: 400 });
    }
    const r = await getRedis();
    let cursor = 0;
    let count = 0;
    do {
      const { cursor: nextCursor, tuples } = await r.hScan(REDIS_HASH_OWNERS, cursor, { COUNT: 1000 });
      cursor = Number(nextCursor);
      for (const { value: owner } of tuples) {
        if ((owner as string) === userId) count++;
      }
    } while (cursor !== 0);
    let name = await r.hGet(REDIS_HASH_USERS, userId);
    if (!name) name = userId.substring(0, 6);
    const percentage = TOTAL_PIXELS ? (count / TOTAL_PIXELS) : 0;
    return Response.json({ id: userId, name, count, percentage } as const);
  } catch {
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
