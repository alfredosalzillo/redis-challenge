# Redis Pixel War

A live, collaborative pixel war showcasing Redis as a multi‑model platform:
- Primary storage: Redis Hash stores pixel colors.
- Real‑time: Redis Pub/Sub broadcasts pixel updates consumed by Server‑Sent Events (SSE).
- History/Audit: Each update is appended to a Redis Stream.
- Presence: Redis ZSET + HASH track who is online and their display names.

Built with Next.js (App Router) and MUI.

## Getting Started

1. Prerequisites:
   - Node.js 18+
   - A Redis instance (local or hosted). Set REDIS_URL env var like `redis://localhost:6379`.

2. Install dependencies:
   - npm install

3. Run the dev server:
   - REDIS_URL=redis://localhost:6379 npm run dev

4. Open the app:
   - http://localhost:3000 (the game runs on the home page)

## How it works
- Storage
  - Key `canvas:colors` (Hash): maps pixel index to hex color. The pixel index is computed as `idx = y * WIDTH + x`.
  - Key `canvas:owners` (Hash): optional mapping from pixel index to the userId who last painted it.
- Real‑time updates
  - Pub/Sub channel `canvas:updates`: each pixel change is published as a JSON message `{ x, y, idx, color, userId, at }`.
  - SSE endpoint `GET /api/stream`: clients receive server‑sent events:
    - event: `pixel` — payload is the published pixel JSON above.
    - event: `presence` — periodic hint so clients refresh online users.
- Bootstrap/load
  - `GET /api/bootstrap`: scans `canvas:colors` via HSCAN and returns `{ colors: Record<idx, color> }`.
- Presence
  - Keys: `presence:online` (ZSET of last‑seen timestamps), `presence:users` (HASH of userId -> name).
  - `POST /api/presence/heartbeat` with `{ userId, name? }`: updates presence and stores a display name.
  - `GET /api/users/online`: returns `{ users: { id, name }[] }` of currently online users.
- Leaderboard & user info
  - `GET /api/users/top`: returns the top conquerors by owned pixels with percentage of the board.
  - `GET /api/users/me?id=...`: returns the current user's stats.
- Streams (history)
  - Redis Stream `stream:canvas`: each pixel update is appended for auditing/time‑travel.

## Environment
- REDIS_URL: Redis connection URI (e.g., redis://localhost:6379)
- REDIS_PASSWORD: Redis password (if applicable)

## Notes
- The canvas initializes white and progressively fills as data loads and real‑time updates arrive.
- SSE periodically emits a small `presence` event; clients use it to refresh presence and leaderboards.

Last updated: 2025-08-10.
