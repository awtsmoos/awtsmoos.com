# B"H — Platform (geelooy/api/social/helper/platform/)

Platform-wide social primitives shared by all surfaces: feeds, follows, live presence, jobs, search, graph transactions, Q&A, moderation, caching, and sync.

## Key files
- `feedRoutes.js` — feed logic; `follow.js` — follows/relationships.
- `live.js` — live presence/publish/subscribe; `platformStore.js` — platform store.
- `jobRunner.js` + `jobs/` — background job system (queue, leases, workers, admission, health, settlement).
- `search.js`, `commentThreads.js` — platform search and ranked comment threads.
- `graphTransactions.js` — atomic graph writes.
- `cacheSync.js`, `ops.js`, `rateLimit.js` — cache sync, ops, rate limiting.
- `routes/` — platform HTTP routes (see its README for endpoints).

## Main route families
`/feed/*` (home, discover, trending, popular, latest, personalized, heichel), `/live/*` (presence, publish, subscribe, replay), `/jobs/*` (enqueue, run), `/mod/*` (actions, reports, queues, escalations), `/sync/*` (op, pull), `/qa/*` (questions, answers, best), `/relationships/*`, `/cache/*`, `/media/*`, `/notifications/digest/:alias`, `/permissions/compile`, `/graph/transaction`, `/federation/import`, `/analytics/metric`, `/search/*`, `/abuse/rateLimit/check`.
