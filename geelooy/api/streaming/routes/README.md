# B"H — Streaming Routes (geelooy/api/streaming/routes/)

Single file: `table.js`. Route table is tiny — two entries:

- `''` — index: returns service name, available connectors, and the
  `/api/streaming/:connector/:action` URL pattern
- `connector` — `routeConnector` from `../core/router.js`, dispatched from
  `:connector` (defaults to `status`) and `:connector/:action`

`_awtsmoos.derech.js` mounts both with CORS headers and 404s on unknown routes.
