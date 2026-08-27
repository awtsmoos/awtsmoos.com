B"H
# Local Tunnel Media Plane

`/api/streaming` is the cloud/control plane.
The local tunnel is the media plane.

Why:
- YouTube needs HLS/RTMPS ingest bytes.
- Twitch/Facebook normally need RTMP/RTMPS ingest bytes.
- Browser JavaScript cannot cleanly push RTMP directly.
- Local tunnel can forward muxed bytes without ffmpeg and without sending media through Awtsmoos cloud.

Current state:
- Session/counter transport exists.
- HLS segment metadata and playlist generation exists.
- Direct forwarding hooks exist.
- Real muxer remains the next hard component.
