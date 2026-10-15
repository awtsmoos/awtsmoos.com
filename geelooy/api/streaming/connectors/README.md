# B"H — Streaming Connectors (geelooy/api/streaming/connectors/)

Per-provider streaming connectors, keyed by `map.js` (`connectorMap`).

- `youtube/` — YouTube Live API: OAuth, broadcast/stream control, HLS/RTMPS ingest metadata
- `twitch/` — manual stream-key first; OAuth for chat/metadata can be added later
- `facebook/` — manual stream URL first; Graph API setup after app review decisions
- `awtsmoos/` — optional hosted relay/record/multicast path where video bytes
  intentionally pass through Awtsmoos

Each connector implements the actions routed by `../core/router.js` from
`:connector/:action`.
