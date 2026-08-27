<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Troubleshooting RAG Search

## Route missing

Inspect the social search aggregator and library route registration. Confirm both `/search/rag/query` and `/rag/search/query` exist.

## Lane missing

Inspect the resolved RAG root, `.awtsdb` basename, sibling fast manifest, list name, count, dimensions, and disabled/corpus identity.

## Embedding error

Inspect model root precedence, GGUF existence, llama binary executability, provider identity, model identity, and output dimensions. Do not touch corpus vectors.

## Persisted-index error

Open read-only and inspect list length, vector metadata, registry count, entry node, persisted keys, graph nodes, and payloads. Run a direct canonical-vector HNSW probe.

## Slow first query

Separate database open, registry load, query embedding, search, and hydration. Confirm registry pointers load by one traversal and warm sessions reuse generation-bound caches.

## False success

Reject empty hits, missing provenance, source other than `awtsdb-hnsw-persisted`, or any exact/linear/text fallback.

## Production rule

Do not restart production while diagnosing. Rehearse on port 8081 and preserve the live hash.
