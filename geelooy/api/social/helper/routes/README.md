# B"H — Routes (geelooy/api/social/helper/routes/)

Master HTTP route assembly for the social API: mounts domain route groups (agent, alias, packed, posts, profile, reading, series, views) into one derech surface.

## Files
- `apiHttp.js` — HTTP plumbing for routes.
- `requestValues.js` — request value decoding.

## Subdirectories
- `agent/` — AI agent API (`/agent/*`).
- `alias/` — alias/user routes (`/alias/*`, `/aliases/*`, `/user/:user/aliases*`).
- `packed/` — packed-data routes (has its own README).
- `posts/` — post routes (has its own README).
- `profile/` — profile routes (`/profile/*`, `/profiles/*`, `/feed`, `/trending`, `/search`, `/openapi.json`).
- `reading/` — reading routes (`/reading/heartbeat|privacy|recent|stats`).
- `series/` — series routes (`/heichelos/:heichel/series/*`).
- `views/` — view counts (`/views/*`, `/comments/by-anchor`, `/comments/verse-counts`).
- `test/` — route composition contracts (alias, packed, profile, route, series compatibility).
