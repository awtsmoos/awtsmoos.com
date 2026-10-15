# B"H — Reading Routes (geelooy/api/social/helper/routes/reading/)

Reading-tracking HTTP routes, backed by `helper/reading/readingStore.js`.

- `readingRoutes.js` — route definitions.

## Endpoints
- `/reading/heartbeat` — record a reading heartbeat (POST).
- `/reading/privacy` — reading privacy settings.
- `/reading/recent/:userId` — recent reads.
- `/reading/stats/:userId` — reading stats.
