# B"H — Olam H3 API (geelooy/api/olam-h3/)

The smallest possible H3 (MiniMax) AI server doorway: validation, mapping, and
credentialed transport kept server-side, with the API key never reaching the
browser.

## Contents
- `_awtsmoos.derech.js` — routes: `/`, `/status`, `/create`, `/task`
- `core/` — body reader, validator, mapper, MiniMax client, handlers.

## Endpoints
- `/` and `/status` — connection capability, no secret disclosure.
- `/create` — create an H3 task through the validated pipeline.
- `/task` — query task state.

## Flow
`body.js` → `validation.js` (H3CombinationValidation) → `mapper.js` →
`client.js` (`NetzachMiniMaxClient` → `https://api.minimax.io`). See
`core/README.md`.
