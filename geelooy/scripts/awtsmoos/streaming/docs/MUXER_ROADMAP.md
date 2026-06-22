B"H
# Streaming Muxer Roadmap

Current landing:
- Shared muxer contract exists.
- HLS passthrough muxer accepts already-muxed segment bytes.
- Nesher pipeline can push those segments through the local tunnel.
- The local tunnel has a raw binary segment route, so browser-to-tunnel segment upload can avoid JSON/base64 overhead.

Evidence from local inspection:
- No package references were found for mux.js, mp4box.js, mpegts.js, hls.js, mp4-muxer, webm-muxer, or @webav in the searched app/script surfaces.
- The bundled MediaBunny library exposes `Mp4OutputFormat`, `VideoSampleSource`, `AudioBufferSource`, `StreamTarget`, and `BufferTarget`.
- The bundled MediaBunny code contains fragmented MP4 support through `fastStart: "fragmented"` and `minimumFragmentDuration`.
- The bundled MediaBunny code did not expose an HLS/M3U8 helper by string search.

Practical next layer:
- Build a real fragmented MP4/CMAF adapter around MediaBunny, then feed real `.m4s` segments plus an init map into the local HLS playlist path.
- Keep MPEG-TS as a separate research path if a browser-compatible TS muxer is introduced later.
- Do not claim YouTube/Twitch/Facebook streaming works until encoded chunks become valid media segments and an ingest smoke test proves it.

Binary route note:
- `POST /streaming/hls-segment/:sessionId/:name` already exists in the local API path per current project handoff.
- The HLS playlist helper now preserves fMP4-oriented metadata such as `#EXT-X-MAP` when `mapUri` or `initSegmentName` is supplied.
