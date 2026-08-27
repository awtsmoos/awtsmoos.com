<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Vector Index Invariants

A strict result is valid only when the persisted HNSW graph produced it. The Awtsmoos joins light and vessel; this contract joins vector identity and indexed provenance without confusing one for the other.

## Required invariants

- The list exists and its length is observable.
- Vector metadata names positive dimensions and a supported metric.
- Registry count is positive and agrees with the indexed corpus.
- Entry node is valid for a nonempty registry.
- Persisted keys, live nodes, and payload-bearing hits agree.
- Query dimensions equal corpus dimensions.
- Strict responses report `strictIndexed`, `indexed`, `index.persisted`, and source `awtsdb-hnsw-persisted`.
- Exact scan, linear scan, and text search are never strict fallbacks.

## Canonical versus derived

Vector coordinates, source records, aliases, comments, series, and model identity are canonical. HNSW nodes, registry pointers, neighbor lists, entry node, levels, and persisted key maps are derived. A derived graph may be rebuilt from verified existing vectors without re-embedding.

## Source anchors

- `api/search/strictQuery.js`
- `api/search/reindex/index.js`
- `api/search/reindex/sourcePointers.js`
- `core/registry/handle.js`
- `test/vector_registry_single_pass_test.js`
- `test/vector_reindex_sequence_iterator_test.js`
