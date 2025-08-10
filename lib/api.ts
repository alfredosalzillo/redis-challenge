import { useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";

const safeError = async (res: Response) => {
  try {
    const data = await res.json();
    return data?.error || res.statusText || `HTTP ${res.status}`;
  } catch {
    return res.statusText || `HTTP ${res.status}`;
  }
};

export const setPixel = async (params: { x: number; y: number; color: string; userId?: string }) => {
  const res = await fetch('/api/pixel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await safeError(res));
  return (await res.json()) as { ok: true };
};

export const bootstrapCanvas = async () => {
  const res = await fetch('/api/bootstrap', { cache: 'no-store' });
  if (!res.ok) throw new Error(await safeError(res));
  return (await res.json()) as { colors: Record<string, string> };
};

export const presenceHeartbeat = async ({ userId, name }: { userId: string; name?: string }) => {
  const res = await fetch('/api/presence/heartbeat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, name }),
  });
  if (!res.ok) throw new Error(await safeError(res));
  return (await res.json()) as { ok: true; at: number };
};

export type OnlineUser = {
  id: string;
  name: string;
}
export const listOnlineUsers = async () => {
  const res = await fetch('/api/users/online', { cache: 'no-store' });
  if (!res.ok) throw new Error(await safeError(res));
  return (await res.json()) as { users: OnlineUser[] };
};

export type TopUser = {
  id: string;
  name: string;
  count: number;
  percentage: number;
}
export const listTopConquerors = async () => {
  const res = await fetch('/api/users/top', { cache: 'no-store' });
  if (!res.ok) throw new Error(await safeError(res));
  return (await res.json()) as { users: TopUser[] };
};

export type CurrentUserInfo = {
  id: string;
  name: string;
  count: number;
  percentage: number;
}
export const getCurrentUserInfo = async (userId: string) => {
  const res = await fetch(`/api/users/me?id=${encodeURIComponent(userId)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await safeError(res));
  return (await res.json()) as CurrentUserInfo;
};

const getOrInit = (storage: Storage, key: string, factory: () => string) => {
  const val = storage.getItem(key);
  if (val) return val;
  const newValue = factory();
  storage.setItem(key, newValue);
  return newValue;
}

export type User = {
  id: string;
  name: string;
}
export const useUser = (): User | null => {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    const id = getOrInit(localStorage, 'userId', () => nanoid())
    const name = getOrInit(localStorage, 'userName', () => `User-${id.slice(0, 6)}`);
    setUser({ id, name });
  }, []);
  return user
};


export const useApiStream = (user: User | null, active: boolean) => {
  const [stream, setStream] = useState<EventSource | null>(null);
  useEffect(() => {
    if (!active) return;
    if (!user) return;
    const es = new EventSource(`/api/stream?${new URLSearchParams({ userId: user.id })}`);
    setStream(es);
    return () => {
      es.close();
    };
  }, [user, active]);
  return stream;
}

export const useApiStreamMessageListener = (stream: EventSource | null, type: 'pixel' | 'presence', listener: (ev: MessageEvent) => void) => {
  const listenerRef = useRef(listener);
  listenerRef.current = listener;
  useEffect(() => {
    if (!stream) return;
    const onMessage = (ev: MessageEvent) => {
      listenerRef.current(ev);
    };
    stream.addEventListener(type, onMessage);
    return () => {
      stream.removeEventListener(type, onMessage);
    }
  }, [type, stream]);
}