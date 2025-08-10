import { createClient } from 'redis';

let client: ReturnType<typeof createClient> | null = null;
let subscriber: ReturnType<typeof createClient> | null = null;

export const REDIS_CHANNEL_CANVAS = 'canvas:updates';
export const REDIS_STREAM_CANVAS = 'stream:canvas';
export const REDIS_HASH_COLORS = 'canvas:colors';
export const REDIS_ZSET_ONLINE = 'presence:online';
export const REDIS_HASH_USERS = 'presence:users';
export const REDIS_HASH_OWNERS = 'canvas:owners';

export const getRedisUrl = () => process.env.REDIS_URL || 'redis://localhost:6379';

export const getRedisPassword = () => process.env.REDIS_PASSWORD || '';

export const getRedis = async () => {
  if (client && client.isOpen) return client;
  client = createClient({ url: getRedisUrl(), password: getRedisPassword() });
  client.on('error', (err) => console.error('Redis Client Error', err));
  await client.connect();
  return client;
};

export const getSubscriber = async () => {
  if (subscriber && subscriber.isOpen) return subscriber;
  subscriber = createClient({ url: getRedisUrl(), password: getRedisPassword() });
  subscriber.on('error', (err) => console.error('Redis Subscriber Error', err));
  await subscriber.connect();
  return subscriber;
};

