# B"H — Streaming API (geelooy/api/streaming/)

Generic live-streaming control plane: one dispatch vessel reaching provider
connectors while each external contract keeps its own key. Browser/WebCodecs is
the media plane (via the local tunnel for ingest bytes); this API is the
cloud/control plane.

Subdirectories:
- `connectors/` — provider connectors (youtube, twitch, facebook, awtsmoos) + `map.js`
- `core/` — `router.js` (connector dispatch), `json.js`, `body.js` helpers
- `routes/` — `table.js`: `''` index + `connector` routed from
  `:connector/:action` URL patterns
- `docs/` — `ARCHITECTURE.md`, `LOCAL_TUNNEL_MEDIA_PLANE.md`

Main routes: `/api/streaming/:connector/:action` — e.g.
`/api/streaming/youtube/status`, `/api/streaming/twitch/start`. Base returns
service name, connector list, and URL patterns.

Note: the missing heavy piece per the architecture doc is the mux/protocol
adapter (browser JS can't cleanly push RTMP; the local tunnel forwards muxed bytes).
