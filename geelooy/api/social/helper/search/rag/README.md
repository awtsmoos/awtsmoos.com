# B"H — Search RAG (geelooy/api/social/helper/search/rag/)

Retrieval-augmented / semantic search: BGE embeddings, flat vector matrices, comment row hydration and relevance, canonical work search, and a multi-lane library search planner with merge, deadlines, and caching.

## Key files
- Embeddings: `bgeEmbedder.js`, `bgeRuntime.js`, `bgeWorker.py`, `bgeWorkerClient.js`, `llama.js`, `llamaInstall.js`.
- Vectors: `flatMatrixBest.js`, `flatMatrixReader.js`, `flatMatrixSearch.js`, `flatMetadataReader.js`.
- Comments: `comments.js`, `commentRowShape.js`, `commentRows` variants (`authoritative`, `bridge`, `legacy`), `commentHydration`, `commentRelevance`, `commentCoordinates`, `importedCoordinates.js`, `hydrate.js`.
- Library search: `librarySearch.js`, `libraryLexicalPlanner.js`, `librarySearchPlanner.js`, `librarySearchMerge(+Helpers).js`, `librarySearchDeadline.js`, `libraryLaneMetadata.js`, `librarySearchEmptyResult.js`, `emptyResult.js`.
- Canonical: `canonicalWorkIndex.js`, `canonicalWorkSearch.js`, `canonicalShards.js`, `canonicalNavigationResult.js`, `exactTanachNavigation.js`, `legacyTextSearch.js`.
- Infra: `manifestCache.js`, `math.js`, `immutableRagWarmup.js`.
- `test/` — 40+ tests: comment hydration/rows, canonical work search, flat matrix bounds, library search merge/concurrency/latency, manifest cache, native publication catalog, RAG warmup, search contracts, response cache, etc.

## Routes
`/search/rag/query`, `/rag/search/query`, `/search/rag/shards`, `/rag/search/shards`, `/search/rag/comments/:comment`, `/search/rag/post-comments`, `/search/rag/llama/status`.
