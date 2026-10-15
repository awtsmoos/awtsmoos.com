# B"H — Olam H3 Core (geelooy/api/olam-h3/core/)

Internals behind the H3 API (see `../README.md`).

## Files
- `handlers.js` — `ChesedH3Handlers`: orchestrates status, create, and task
  routes without growing another backend.
- `body.js` — `MalchusBodyReader`: request body parsing.
- `validation.js` — `GevurahH3Validator` + `H3CombinationValidation`: input guards.
- `mapper.js` — `TiferesH3Mapper`: request-to-upstream mapping.
- `client.js` — `NetzachMiniMaxClient`: credentialed server-side transport to
  `https://api.minimax.io` (key stays in `MINIMAX_API_KEY` env, never in browser).
