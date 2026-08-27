<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Database Lifecycle and Manifests

A database file is not a published lane merely because it exists. Publication is a lifecycle with evidence gates.

## Lifecycle

1. Inspect source, hash, size, blocks, inode, open handles, WAL, and manifests.
2. Create an isolated copy-on-write candidate.
3. Perform writes only on the candidate.
4. Call `waitForIdle()` before close, copy, hash, audit, or publication.
5. Reopen read-only and verify semantic and index invariants.
6. Generate a complete sibling fast manifest.
7. Exercise strict API routes on an isolated server before and after restart.
8. Preserve source, candidate, evidence, and rollback.
9. Require explicit approval for production cutover.

## Manifest boundary

The RAG catalog accepts a root-level `.awtsdb` only with a same-basename `.fast-manifest.json`. The manifest must identify the list, positive record count, positive dimensions, corpus identity, and database identity. Actual read-only registry readiness must independently agree.

## Never

- Never compact a live file in place.
- Never treat manifest presence as index proof.
- Never publish a partially written candidate.
- Never delete the only rollback or vector corpus.
