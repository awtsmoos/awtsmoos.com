# B"H — Streaming Core (geelooy/api/streaming/core/)

Shared control-plane plumbing.

- `router.js` — dispatches `:connector/:action` to the right provider connector
- `json.js` — ok/fail response packets
- `body.js` — request body parsing

Used by `routes/table.js`; keeps connector action calling and error shaping
consistent across providers.
