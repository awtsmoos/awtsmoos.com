<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Indexed Search Performance Model

Strict RAG latency is the sum of lane discovery, readiness, query embedding, persisted HNSW traversal, payload hydration, and response serialization. Measure each component before changing index quality.

## Cold path

Cold requests may open the database, hydrate vector metadata, load registry pointers, and populate graph-node caches. Registry traversal must be single-pass; repeated sequence-root parsing can turn startup quadratic.

## Warm path

Warm requests should reuse the open read-only handle, resolved list, metadata, registry pointer array, and graph-node cache. A cache fingerprint must include device, inode, size, and modification time so atomic replacement invalidates the old generation.

## Performance evidence

Record wall time plus embedding, search, hydration, and serialization timing. Test both strict route spellings, every published indexed lane, repeated warm queries, and an isolated restart.

## Forbidden optimization

Never hide latency by exact scan, linear scan, text fallback, lower-quality unapproved HNSW settings, or embedding regeneration. Performance work must preserve persisted-index provenance and recall.
