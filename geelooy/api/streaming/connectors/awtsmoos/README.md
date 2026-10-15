# B"H — Awtsmoos Streaming Connector (geelooy/api/streaming/connectors/awtsmoos/)

Optional hosted relay/record/multicast path where video bytes intentionally
pass through Awtsmoos, instead of going direct-to-platform from the browser.

Single module: `index.js`. Activated via `/api/streaming/awtsmoos/:action`
through the connector dispatch in `../core/router.js`.
