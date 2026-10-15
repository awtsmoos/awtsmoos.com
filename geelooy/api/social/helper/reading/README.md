# B"H — Reading (geelooy/api/social/helper/reading/)

Reading tracking store (heartbeats, privacy, recents, stats). Mounted via `_awtsmoos.reading.js`; routes in `helper/routes/reading/`.

- `readingStore.js` — reading record storage.

## Endpoints
- `/reading/heartbeat` (POST), `/reading/privacy` (GET/POST)
- `/reading/recent/:userId`, `/reading/stats/:userId`
