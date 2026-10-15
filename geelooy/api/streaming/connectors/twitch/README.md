# B"H — Twitch Streaming Connector (geelooy/api/streaming/connectors/twitch/)

Twitch streaming connector: manual stream-key first. OAuth for chat/metadata
can be added later.

Single module: `index.js`. Activated via `/api/streaming/twitch/:action`
through the connector dispatch in `../core/router.js`.
