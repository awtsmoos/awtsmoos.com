# B"H — Profile (geelooy/api/social/helper/profile/)

The profile domain: public profiles, feeds, discovery, follows, trending, posts, comments, activity, stats, and Heichel discovery. Mounted via `_awtsmoos.profile.js` and `helper/routes/profile/`.

## Key files
- `readProfile.js`, `writeProfile.js`, `sanitize.js`, `paths.js`, `apiTools.js` — profile CRUD and helpers.
- `activity.js`, `history.js`, `stats.js`, `tree.js` — activity, history, stats, alias tree.
- `follows.js` — follow relationships.
- `discovery*.js` (discovery, discoveryFeed, discoveryInsights, discoveryOperations, discoverySearch) — discovery surfaces.
- `heichelDiscovery.js`, `heichelDiscoveryIds.js`, `heichelos.js` — Heichel discovery.
- `feedFairness.js` — fair feed ranking.
- `livingCard.js`, `templates.js` — living cards and profile templates.
- `comments.js`, `commentBrowse.js`, `posts.js` — profile comments and posts.
- `publicAliases.js`, `publicAliasRanking.js`, `publicSites.js` — public alias directory.
- `openapi.js` — OpenAPI spec; `HeichelPublicationPolicy.js` — publication policy.
- Subdirs: `pagination/` (ChronologicalPagination), `posts/` (PostCollector/Projection/Coordinates/PostsByAlias), `trending/` (TrendingRanker/Score), `test/`.

## Main endpoints (via `helper/routes/profile/`)
`/profile/:alias`, `/profiles/:alias` (+ `/activity`, `/comments`, `/posts`, `/heichelos`, `/series-tree`, `/tree`, `/analytics`, `/graph`, `/history`, `/living-card`, `/comment-series`), `/profile/feed`, `/profile/batch`, `/trending`, `/feed`, `/search`, `/heichelos/discover`, `/recommendations/:alias`, `/alias/:alias/history|profile`, `/follows/:alias`, `/followers/:type/:id`, `/bulk`, `/events`, `/meta`, `/openapi.json`, `/profile/templates`.
