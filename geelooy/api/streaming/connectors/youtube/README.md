# B"H — YouTube Streaming Connector (geelooy/api/streaming/connectors/youtube/)

YouTube Live streaming connector: OAuth + YouTube Live API broadcast/stream
control, with HLS/RTMPS ingest metadata.

Files: `index.js` (connector entry), `client.js`, `oauth.js`, `config.js`,
`tokenStore.js`. Activated via `/api/streaming/youtube/:action` through the
connector dispatch in `../core/router.js`. (Distinct from the separate
`/api/youtube/` family, which is account/video/upload management.)
