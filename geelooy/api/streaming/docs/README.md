# B"H — Streaming Docs (geelooy/api/streaming/docs/)

Design notes for the streaming family.

- `ARCHITECTURE.md` — control plane vs media plane, connector capabilities,
  three data paths (direct-to-platform, Awtsmoos hosted relay, manual ingest),
  and the known gap: the mux/protocol adapter
- `LOCAL_TUNNEL_MEDIA_PLANE.md` — why the local tunnel carries media bytes
  (browser JS can't cleanly push RTMP), session/counter transport, HLS
  segment metadata and playlist generation
