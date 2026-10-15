# B"H — YouTube API (geelooy/api/youtube/)

Awtsmoos YouTube family: Google OAuth, channel info, video upload/metadata,
and live broadcast management — with provider secrets kept outside Git.
Powers the browser manager at `/youtube/` (connect Google, pick a channel,
upload videos, edit metadata).

Subdirectories:
- `core/` — OAuth, session/cookie/token storage, vault, API client, json/body
- `routes/` — handler modules + `table.js` route registry
- `docs/` — `SETUP.md` (Google Cloud OAuth config, secret installation)
- `test/` — security tests (`security.test.cjs`)

Main routes (from `routes/table.js`): `auth/start`, `auth/callback`,
`auth/status`, `auth/logout` (aliased as `oauth/*`), `channel`, `channel/mine`,
`uploads/start`, `videos`, `videos/list`, `videos/update`, `live`, `live/list`,
`live/create`, `live/transition`. OAuth modes escalate: read → upload → manage.
`_awtsmoos.derech.js` dispatches 1–3 path segments to the table with
`Cache-Control: private, no-store` and strict security headers.
