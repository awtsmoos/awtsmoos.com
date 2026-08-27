B"H
# Nesher Local Tunnel Streaming

`localTunnelStreaming.js` talks to the local tunnel API.
`hlsTunnelSession.js` wraps start -> enqueue segment -> flush -> stop.
`segmentQueue.js` prevents unbounded browser-side memory growth while muxers emit media segments.

Current implemented browser mux path:
- `mediabunnyFmp4Stream.js` imports MediaBunny 1.46 from `https://esm.sh/mediabunny@1.46.0?bundle`.
- It uses `Mp4OutputFormat({ fastStart:'fragmented' })` with `onFtyp`, `onMoov`, `onMoof`, and `onMdat` callbacks.
- It captures the composed Nesher canvas through `CanvasSource` and pushes `init.mp4` plus real `moof+mdat` `.m4s` fragments into the local tunnel session.

Media path:
Nesher scene canvas -> MediaBunny CanvasSource -> H.264 fragmented MP4 -> local tunnel -> platform ingest or relay.

Control path:
`/api/streaming` creates or configures connector metadata. It does not receive video bytes unless the user chooses the Awtsmoos hosted connector.

Activation warning:
The repository contains the streaming local API route, but the currently running installed tunnel may be older. If `/streaming/start` returns a filesystem `list` response, restart/reinstall the Awtsmoos Tunnel agent so the installed local API exposes the streaming routes.
