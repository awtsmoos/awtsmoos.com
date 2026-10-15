# B"H — YouTube Routes (geelooy/api/youtube/routes/)

Handler modules registered in `table.js`:

- `auth.js` — `auth/start`, `auth/callback`, `auth/status`, `auth/logout`
  (also exposed under the `oauth/` prefix)
- `channel.js` — `channel`, `channel/mine` (own channel info)
- `uploads.js` — `uploads/start` (video upload flow)
- `videos.js` — `videos`, `videos/list`, `videos/update` (owned video metadata)
- `live.js` — `live`, `live/list`, `live/create`, `live/transition` (live broadcasts)

`table.js` exports `routeTable` plus a `''` index listing all routes.
`_awtsmoos.derech.js` resolves up to three path segments against it.
