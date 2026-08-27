<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Field Guide: RAG Repair Without Re-embedding

1. Record production PID, port, cwd, environment clues, live hashes, sizes, inodes, and open handles.
2. Probe `/search/rag/query` and `/rag/search/query` with `autoInstall=false`.
3. Require structured errors and full provenance; status 200 alone is insufficient.
4. Trace route registration and immutable strict options.
5. Resolve lane -> root -> `.awtsdb` -> fast manifest -> list.
6. Verify query model file, provider, binary, and dimensions.
7. Open the database read-only; verify list length, metadata, registry count, entry node, keys, and payloads.
8. Query one canonical stored vector through persisted HNSW.
9. Repair path, process, model resolver, session cache, registry traversal, or manifest before corpus work.
10. If the graph alone is absent, clone to a candidate and rebuild from existing vectors.
11. Run cold, warm, compatibility-route, and isolated-restart probes.
12. Recompute hashes and prove no canonical vector file changed.

Never accept exact or linear fallback. Never regenerate embeddings without the explicit incompatibility gate in `EMBEDDING_REUSE_POLICY.md`.
