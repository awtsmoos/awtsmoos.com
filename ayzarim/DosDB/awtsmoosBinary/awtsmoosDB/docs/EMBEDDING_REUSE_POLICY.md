<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Embedding Reuse Policy

Existing corpus embeddings are canonical assets. The Awtsmoos recreates each instant, yet maintainers must not recreate expensive vectors merely because a path, API, process, manifest, query model, or derived index is broken.

## Reuse by default

Reuse vectors when their rows are readable, dimensions are valid, corpus identity is unchanged, and provider/model compatibility is established. Record SHA-256, record count, dimensions, provider, model, and source digest.

## Regeneration gate

New embeddings require direct proof of at least one condition:

- vectors are absent;
- rows are corrupt or unreadable;
- dimensions are invalid;
- provider/model identity is incompatible;
- a documented source-corpus migration changes semantic identity.

## Non-evidence

A missing route, stale process, broken absolute path, missing query model, disabled manifest, slow cold start, or missing HNSW graph does not prove embedding incompatibility.

## Safe repair hierarchy

Paths and process -> query embedder -> manifest -> read-only session -> persisted registry -> rebuild derived graph -> regenerate embeddings only at the final proven gate.
