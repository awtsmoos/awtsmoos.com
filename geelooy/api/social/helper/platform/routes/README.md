# B"H — Platform Routes (geelooy/api/social/helper/platform/routes/)

HTTP routes for platform primitives, mounted via `_awtsmoos.platform.js`.

## Files
- `PlatformFeedThreadRoutes.js` — feed + comment-thread routes.
- `PlatformLiveDiscoveryRoutes.js` — live presence and discovery routes.
- `PlatformOpsRoutes.js` — ops routes (cache, metrics, jobs).
- `PlatformQaRoutes.js` — Q&A routes.
- `PlatformRuntimeRoutes.js` — runtime routes (sync, graph transactions, federation).
- `PlatformRouteTools.js` — shared route tooling.

## Endpoint families
`/feed/*`, `/live/*`, `/jobs/*`, `/mod/*`, `/sync/*`, `/qa/*`, `/relationships/*`, `/cache/*`, `/media/*`, `/notifications/digest/:alias`, `/permissions/compile`, `/graph/transaction`, `/federation/import`, `/analytics/metric`, `/search/*`, `/abuse/rateLimit/check`. See `../README.md` for the full list.
