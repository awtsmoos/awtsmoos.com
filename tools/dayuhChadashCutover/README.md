B"H

# Dayuh Chadash Final Cutover

The Awtsmoos creates every byte anew. This tool keeps canonical social truth small,
places active AI assets under a portable runtime root, and preserves every legacy or
divergent byte in reversible quarantine for Awtsmoos.com.

## Guarantees

- No recursive deletion of canonical, historical, or divergent content.
- No cross-device copy disguised as an atomic move.
- No move while managed PIDs, port 8080, or data-root handles are active.
- Every completed rename is written atomically to external state.
- The llama.cpp development checkout enters quarantine before the lean AI tree moves.
- The active runtime receives only `llama-embedding` and its required libraries.
- The copied runner must produce a real 384-dimensional BGE embedding.
- RAG manifests retain exact original text for rollback.
- Canonical comments, posts, series, and alias index remain inside the data root.
- One combined canonical-plus-runtime ceiling defaults to two gibibytes.
- Acceptance requires inode, manifest, embedding, and storage-budget verification.
- Quarantine is retained after acceptance; pruning is a separate human decision.

## Configuration

All paths are portable and may be overridden:

```sh
export AWTSMOOS_REPOSITORY_ROOT=/path/to/awtsmoos.com
export AWTSMOOS_DB_ROOT=/path/to/dayuhChadash
export AWTSMOOS_RUNTIME_ROOT=/path/to/dayuhChadash-runtime
export AWTSMOOS_AI_ROOT=/path/to/dayuhChadash-runtime/ai
export AWTSMOOS_RAG_ROOT=/path/to/dayuhChadash-runtime/ai/comment-rag
export AWTSMOOS_REVIEW_ROOT=/path/to/dayuhChadash-review
export AWTSMOOS_CUTOVER_QUARANTINE_ROOT=/path/to/quarantine
export AWTSMOOS_STORAGE_HARD_BYTES=1073741824
export AWTSMOOS_RUNTIME_ASSET_HARD_BYTES=1073741824
export AWTSMOOS_ACTIVE_HARD_BYTES=2147483648
export PORT=8080
```

`AWTS_DB_ROOT` remains a compatibility alias, but new deployments should use
`AWTSMOOS_DB_ROOT`.

## Publication court

```sh
node tools/dayuhChadashCutover/releaseCheck.js
npm run test:dayuh-release
npm test
```

The court checks syntax, tests, tab indentation, the 120-line ceiling, documentation,
exact publication scope, portable paths, and Git whitespace. The real HTTP mutation
journey starts a private server on a temporary port with a guarded temporary DosDB
root. It never writes to live Dayuh data.

## Verified source preflight

The July 17, 2026 preflight copied an 18.1 MiB relocatable llama runtime, produced a
real 384-dimensional embedding, and completed text and vector searches against both
persisted lanes: `sefer-hasichos` and `likkutei-sichos`. Canonical allocation was
unchanged before and after the read-only preflight.

The measured post-cutover projection was 1,790,947,328 active bytes with 356,536,320
bytes of headroom beneath the absolute two-gibibyte ceiling. These measurements are
publication evidence, not permission to perform the live cutover.

## Operator flow

```sh
node tools/dayuhChadashCutover/cli.js plan
# Stop the managed supervisor and prove port and handles are dark.
node tools/dayuhChadashCutover/cli.js install
# Start production with AWTSMOOS_AI_ROOT and AWTSMOOS_RAG_ROOT exported.
node tools/dayuhChadashCutover/cli.js testing
node tools/dayuhChadashCutover/cli.js verify
# Run social, RAG, hydration, restart, and growth courts.
node tools/dayuhChadashCutover/cli.js accept
```

Any failed court returns through:

```sh
node tools/dayuhChadashCutover/cli.js rollback
```

An interrupted `preparing`, `installing`, or `failed` state may be recovered with:

```sh
node tools/dayuhChadashCutover/cli.js recover
```

See `PUBLISHING.md` for the complete release boundary.
