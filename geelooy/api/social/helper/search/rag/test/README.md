# B"H — Search RAG Tests (geelooy/api/social/helper/search/rag/test/)

Tests for the RAG/semantic search stack (40+ files).

- Comment lanes: `authoritativeCommentRows`, `bridgeCommentRows`, `packedCommentRows`, `richCommentRows`, comment hydration guards, relevance, coordinates, metadata hits.
- Canonical: `canonicalWorkSearch`, `exactTanachNavigation`, catalog/sidecar.
- Library: multi-lane search, latency/concurrency policy, merge/bounded failure, deadline, native text search, publication catalog storage policy/rollback.
- Infra: `manifestCache`, `ragStartupWarmup`, `searchCacheWarmup`, `searchColdPathIsolation`, request snapshot, response cache, search contracts, runtime AI discovery, runtime path resolution, llama embedding args, `liveSearchProbe.js` (live probe, not a test).
