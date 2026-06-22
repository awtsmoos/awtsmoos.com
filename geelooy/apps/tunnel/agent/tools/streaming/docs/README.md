B"H
# Local Tunnel Streaming Actions

The local tunnel is the media-plane helper. The browser sends muxed bytes to `127.0.0.1`, and the tunnel forwards those bytes to YouTube/Twitch/Facebook/custom ingest. Video bytes do not pass through Awtsmoos cloud unless the user selects Awtsmoos hosted relay.

Actions:
- `streamingSessionStart`
- `streamingChunkPush`
- `streamingHlsSegmentPush`
- `streamingHlsPlaylist`
- `streamingSessionStop`
- `streamingSessionStatus`
- `streamingSessionList`

HLS mode:
1. Start a session with `{ mode:"hls", targetDuration, maxSegments, ingest }`.
2. Push muxed `.ts` segment bytes with `streamingHlsSegmentPush`.
3. Ask for `streamingHlsPlaylist` to get the current sliding `.m3u8`.
4. Stop the session to receive an end-list playlist.

Important: WebCodecs encoded chunks still need a real muxer before they become platform-ready HLS/RTMP media bytes.
