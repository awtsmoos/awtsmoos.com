# B"H — Search Routes (geelooy/api/social/helper/search/routes/)

HTTP routes for all search surfaces, mounted via `_awtsmoos.search.js`.

## Files
- `routeGroups.js` — assembles route groups; `values.js`, `requestSnapshot.js`, `responseStatus.js`, `safe.js`, `capabilities.js` — route plumbing.
- `exact.js` — exact Hebrew routes; `semantic.js` — semantic routes.
- `library.js` — library search routes; `lexicon.js` — lexicon/dictionary routes.
- `tanach.js` — Tanach search routes; `comments.js` — comment search routes.

## Endpoints
- `/search/exact/hebrew[/meta]`, `/search/semantic`, `/search/capabilities`
- `/search/library/query|browse|dictionary[/alphabet|ranges|browse]|dictionaries|shards`
- `/search/rag/query|shards|comments/:comment|post-comments|llama/status`, `/rag/search/query|shards`
- `/search/tanach/hebrew`, `/search/tanach/native`
- `/dictionary/alphabet|ranges|browse`

`test/` — lexicon browse registration and semantic route tests.
