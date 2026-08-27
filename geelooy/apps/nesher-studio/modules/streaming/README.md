B"H
# Nesher YouTube Streaming Modules

`youtubeControl.js` talks to `/api/youtube` for OAuth/control metadata.
`hlsUploader.js` is the direct-to-YouTube byte path.

Still needed for actual live streaming:
- WebCodecs H.264/AAC encoder settings finalized.
- Browser JS muxer that emits YouTube-compatible HLS media segments and playlists.
- A segment scheduler that sends those bytes through `hlsUploader`.

This intentionally avoids ffmpeg and avoids sending video bytes through awtsmoos.com.
