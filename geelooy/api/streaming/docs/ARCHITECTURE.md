B"H
# Streaming Architecture

`/api/streaming` is the generic control plane.

Connectors:
- `youtube`: OAuth + YouTube Live API broadcast/stream control. Supports HLS/RTMPS ingest metadata.
- `twitch`: manual stream-key first. OAuth can be added later for chat/metadata.
- `facebook`: manual stream URL first. Graph API setup can be added after app review decisions.
- `awtsmoos`: optional hosted relay/record/multicast path where video bytes intentionally pass through Awtsmoos.

Data paths:
1. Direct-to-platform local path: Browser/WebCodecs -> local muxer/protocol adapter -> platform ingest.
2. Awtsmoos hosted option: Browser/WebCodecs -> Awtsmoos relay -> viewers/platforms.
3. Manual custom ingest: User supplies server URL + stream key.

The missing heavy piece remains the mux/protocol adapter.
