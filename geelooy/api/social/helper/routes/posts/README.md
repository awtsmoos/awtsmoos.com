B"H

# Post / Reader APIs — Agent Handoff

How the site serves imported posts. All paths relative to `/api/social`. Reading flows: route → `readPostRoute({heichelId, seriesId, postId})` → `readPostCompatible` → `readSeriesPost` against the **native** db path `/social/heichelos/<heichel>/series/<series>/posts` (not the packed shard), with Meluket mapped-series handling underneath.

## Post routes (`routes/posts/seriesRoutes.js`, `readers.js`)

| Route | Method | Purpose |
|---|---|---|
| `/heichelos/:heichel/series/:series/posts` | GET | Post list (`?limit/offset/details/properties`) |
| `/heichelos/:heichel/series/:series/posts/details` | GET | List with details |
| `/heichelos/:heichel/series/:series/post/:post` | GET | **One post by heichel+series+postId — the front-end reader primitive** |
| `/heichelos/:heichel/series/:series/post/:post` | PUT/DELETE | Edit / delete (DELETE needs `aliasId`) |
| `/heichelos/:heichel/series/:series/posts/bulk` | POST | Bulk publish |
| `/heichelos/:heichel/series/:series/filterPostsBy/:propKey/:propVal` | GET | Property filter |
| `/aliases/:alias/postsMade/heichel/:heichel/pathToSeries/:pathive` | GET | Alias's posts in a series |
| `/aliases/:alias/postsMade/heichelos`, `/aliases/:alias/postsMade/heichel/:heichel/series` | GET | Authorship navigation |

## Raw packed reads (`routes/packed/readRoutes.js`, all GET)

| Route | Purpose |
|---|---|
| `/packed/read?shard=core&key=/posts/<heichel>/<postId>` | Single record; 404 → `{error:{code:'NOT_FOUND'}}`; missing key → `MISSING_KEY` |
| `/packed/keys?shard=core&prefix=/posts/<heichel>/&limit=200` | Bounded key listing (limit capped 200–2000) |
| `/packed/stats`, `/packed/snapshot`, `/packed/integrity` | Shard stats / export / scan (no repair) |

**⚠️ Never loop `/packed/read` over many keys** — it parses the entire core shard file per request and will 500/DOS production at bulk scale. Use `/packed/keys` + one server-side job (`/packed/import/posts/verify`) instead.

## Signed import/remove endpoints (summary)

Full docs in `../packed/README.md`. Quick reference:

| Method | Path | Purpose |
|---|---|---|
| POST | `/packed/import/posts/start` | Start an import job (`{uploadId}`) |
| GET | `/packed/import/posts/status?job=<id>` | Poll job |
| POST | `/packed/import/posts/verify` | Byte-exact verify job |
| GET | `/packed/import/posts/verify-status?verify=<id>` | Poll verify |
| POST | `/packed/import/posts/ensure-backlinks` | Repair missing alias backlinks only |
| POST | `/packed/import/posts/remove` | Delete a misplaced post (+ optional `strayAliasId` cleanup) |

## Files map

- `geelooy/api/social/helper/routes/posts/{seriesRoutes.js,readers.js,aliasRoutes.js,bulkPublish.js,submissionRoutes.js}`
- `geelooy/api/social/helper/routes/packed/{postImportRoutes.js,readRoutes.js}`
- `geelooy/api/social/helper/packed/{socialPacked.js,packedReader.js}`
