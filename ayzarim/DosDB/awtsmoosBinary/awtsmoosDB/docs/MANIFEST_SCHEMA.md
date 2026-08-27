<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Fast Manifest Schema

The sibling `.fast-manifest.json` is a publication declaration, not a substitute for opening the database.

## Required identity

- `listName`: persisted vector-list name.
- `recordCount`: positive expected corpus count.
- `dimensions`: positive vector dimensions.
- corpus or source identity: non-disabled and traceable.
- database identity: path/basename and preferably SHA-256, bytes, and modification generation.
- model identity: compatible provider and model where recorded.
- index identity: registry count, entry node, metric, and build metadata where recorded.

## Admission rules

The `.awtsdb` and manifest share a basename and live in the configured RAG root. A manifest with missing identity, disabled corpus, zero count, or zero dimensions is not public. Read-only readiness must still prove the list and persisted registry are usable.

## Replacement

Publish database and manifest as one coherent generation. Preserve the previous pair in rollback material. Restart only an isolated server until explicit production approval is given.

## Drift prevention

Never copy a manifest with stale absolute paths or a hash from another candidate. Recompute identity after the final idle close.
