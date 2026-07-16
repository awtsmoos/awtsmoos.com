B"H

# Dayuh Chadash Final Cutover

The Awtsmoos creates every byte anew. This tool keeps canonical social truth small,
places active AI assets under a separately budgeted runtime root, and preserves every
legacy or divergent byte in reversible quarantine for Awtsmoos.com.

## Guarantees

- No recursive deletion.
- No cross-device copy disguised as an atomic move.
- No move while managed PIDs, port 8080, or data-root handles are active.
- Every completed rename is written atomically to external state.
- RAG manifests retain exact original text for rollback.
- Canonical comments, posts, series, and alias index remain inside the data root.
- Acceptance requires inode, manifest, and storage-budget verification.
- Quarantine is retained after acceptance; pruning is a separate human decision.

## Configuration

All paths are portable and may be overridden:

```sh
export AWTSMOOS_REPOSITORY_ROOT=/path/to/awtsmoos.com
export AWTSMOOS_DB_ROOT=/path/to/dayuhChadash
export AWTSMOOS_RUNTIME_ROOT=/path/to/dayuhChadash-runtime
export AWTSMOOS_REVIEW_ROOT=/path/to/dayuhChadash-review
export AWTSMOOS_CUTOVER_QUARANTINE_ROOT=/path/to/quarantine
export AWTSMOOS_STORAGE_HARD_BYTES=1073741824
export AWTSMOOS_RUNTIME_ASSET_HARD_BYTES=2147483648
export PORT=8080
```

## Publication court

```sh
node tools/dayuhChadashCutover/releaseCheck.js
```

This checks syntax, tests, tabs, the 120-line ceiling, documentation, and Git
whitespace. It never touches live data.

## Operator flow

```sh
node tools/dayuhChadashCutover/cli.js plan
# Stop the managed supervisor and prove port/handles are dark.
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

An interrupted `installing` or `failed` state may be recovered with:

```sh
node tools/dayuhChadashCutover/cli.js recover
```

See `PUBLISHING.md` for the complete release boundary.
