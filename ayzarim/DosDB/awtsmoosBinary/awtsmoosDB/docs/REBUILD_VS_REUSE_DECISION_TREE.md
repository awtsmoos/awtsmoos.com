<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Rebuild Versus Reuse Decision Tree

## Are canonical vectors present and readable?

- No: recover them from preserved corpus/rollback before generating anything.
- Yes: continue.

## Do dimensions and corpus identity match the query model?

- No: investigate model/provider configuration and migration history. Re-embed only after incompatibility is proven.
- Yes: reuse vectors.

## Is the persisted HNSW graph usable?

- Yes: repair route, path, manifest, process, or session only.
- No: continue.

## Is only derived index state missing or stale?

- Yes: copy to an isolated candidate and rebuild HNSW from existing vectors.
- No: audit database corruption and recover canonical records/vectors from preserved material.

## Is the database merely fragmented?

- Yes: vacuum to a separate candidate; do not re-embed or mutate live in place.

## Publication

Require semantic digest, count, dimensions, registry, recall, read-only restart, SHA-256, API restart matrix, rollback, and explicit cutover approval.
