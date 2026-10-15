# B"H — Social Helpers (geelooy/api/social/helper/)

Shared implementation layer for the entire social API. The `_awtsmoos.*.js` route chapters at the parent level are thin mounts; the real logic lives here.

## Key files
- `index.js` — consolidates and re-exports the core modules (general, mail, comments, posts, heichels).
- `general.js` — `loggedIn`, `er` error helper used everywhere.
- `mail.js`, `notifications.js`, `communications.js`, `counter.js`, `fileSystem.js`, `alias.js`, `apiKeys.js`, `heichel.js`, `heichelRoles.js`, `livePresence.js`.
- `contentCanonicalBridge.js`, `contentCanonicalDb.js`, `contentRouteSupport.js` — canonical content bridge used by route modules.

## Subdirectories (one per domain)
`api` · `assets` · `awtsmoosDb` · `books` · `civilization` · `comments` · `communicationInbox` · `communicationRoutes` · `community` · `drive` · `editor` · `entities` · `entityUniverse` · `governance` · `heichelRoutes` · `imports` · `livingEntityView` · `mail` · `migrations` · `nodeOs` · `notifications` · `objects` · `old` · `packed` · `platform` · `post` · `profile` · `profileHub` · `radiance` · `reactions` · `reading` · `repositories` · `response` · `richSocial` · `routes` · `search` · `series` · `socialKernel` · `socialSummary` · `thoughtStreams` · `unifiedActivity` · `unifiedInteraction` · `unifiedSocial` · `views`

## Tests
`test/` holds cross-domain integration tests (apiKeys, heichelRoles, notifications, packed engine, platform, post migration, response shapes, social graph). Each domain also keeps its own `test/` dir; see those READMEs.
