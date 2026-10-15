# B"H — Search (geelooy/api/social/helper/search/)

The search domain: exact Hebrew search, series search, lexicon/dictionary browsing, semantic/RAG search, library search, and Tanach search.

## Key files
- `exactHebrew*.js` (Bucket/Index/JsonSlice/Paths/Pending/Public/Records/Response/Serializable/Shape/V3/Worker/WorkerClient/WorkerDb) — exact Hebrew text search engine, with a worker process.
- `exactSeriesIndex.js`, `exactSeriesText.js` — exact series text indexing/search.
- `corpusSearchPolicy.js` — corpus search policy.
- Subdirs: `lexicon/` (dictionary browse/search over a binary record format), `rag/` (semantic/RAG search with BGE embeddings, flat matrices, library search planner), `routes/` (search HTTP routes), `tanach/` (Tanach search with native data per sefer), `test/`.

## Main endpoints (via `routes/`)
- `/search/exact/hebrew[/meta]` — exact Hebrew search.
- `/search/semantic` — semantic search.
- `/search/capabilities` — search capabilities.
- `/search/library/*` — library query/browse/dictionary/shards.
- `/search/rag/*`, `/rag/search/*` — RAG query/shards/comments.
- `/search/tanach/hebrew`, `/search/tanach/native` — Tanach search.
- `/dictionary/*` — dictionary alphabet/ranges/browse.
