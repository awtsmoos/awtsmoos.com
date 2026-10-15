# B"H — Ohrbound Routes (geelooy/api/ohrbound/routes/)

Route implementations for the Ohrbound API (see `../README.md`).

## Files
- `table.js` — the frozen route table: `progress/:alias`, `levels`. One explicit
  table consumed by mounting, testing, and docs alike.
- `progress.js` — binds one bounded cloud progress document to a player alias.
- `levels.js` — public level catalog plus GET/POST/DELETE publish/delete intents.
