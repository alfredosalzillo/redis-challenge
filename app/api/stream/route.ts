import { getSubscriber, REDIS_CHANNEL_CANVAS } from '@/lib/redis';

export const runtime = 'nodejs';

export async function GET() {
  const encoder = new TextEncoder();
  let cleanup: null | (() => Promise<void>) = null;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const sub = await getSubscriber();
      let closed = false;

      const safeEnqueue = (text: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(text));
        } catch {
          // If the controller is already closed
          cleanup?.()
        }
      };

      const onMessage = (message: string) => {
        safeEnqueue(`event: pixel\n` + `data: ${message}\n\n`);
      };

      await sub.subscribe(REDIS_CHANNEL_CANVAS, onMessage);

      // Send a welcome comment to keep connection alive quickly
      safeEnqueue(`: connected\n\n`);

      // Heartbeat
      const interval = setInterval(() => {
        safeEnqueue(`: keep-alive ${Date.now()}\n\n`);
      }, 15000);

      // Presence ping broadcast every 10s: clients can separately hit heartbeat API to be counted online
      const presenceInterval = setInterval(() => {
        // Hint clients to refresh presence list
        safeEnqueue(`event: presence\n` + `data: {}\n\n`);
      }, 10000);

      cleanup = async () => {
        if (closed) return;
        closed = true;
        clearInterval(interval);
        clearInterval(presenceInterval);
        try {
          await sub.unsubscribe(REDIS_CHANNEL_CANVAS);
        } catch {}
      };
    },
    async cancel() {
      if (typeof cleanup === 'function') {
        await cleanup();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
