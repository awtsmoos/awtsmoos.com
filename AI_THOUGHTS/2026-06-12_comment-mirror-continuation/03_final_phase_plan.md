B"H

# Phase 3 — Final File Plan

## Final conclusion before writing

The packed mirror is only a fast-read sidecar. The authoritative comment write already completed when appendToArrayAtKey succeeded. Therefore the API must not wait for the mirror.

At the same time, reads still rely on packed aggregates in some routes. A queued mirror alone removes add/delete latency, but a cold read can still replay the entire core shard. The JSONL layer should keep a process-local latest map per shard file, invalidated by file size/mtime.

## Exact implementation plan

### jsonlShard.js

Rewrite the complete file.

Add:
- cache Map keyed by absolute file path.
- fileSignature(file) using fs.statSync size + mtimeMs.
- loadLatest(file) that replays once, stores latest map, and returns it.
- appendRecord(file, record) that appends and updates cache if loaded.
- getLatest(file, key) that uses loadLatest.
- readRecords remains direct for list/stat callers.

### commentShardMirror.js

Rewrite the complete file.

Add:
- traceMirrorPhase(label, data) writing .awtsmoos-tmp/comment-shard-mirror-phases.jsonl.
- timed(label, fn, bucket) for per-read/per-write timing.
- runQueuedMirror(kind, payload, worker), a serial setImmediate queue.
- writeCommentShardRecord returns queued by default.
- deleteCommentShardRecord returns queued by default.
- writeCommentShardRecordSync and deleteCommentShardRecordSync perform the existing real work with timings.
- Environment override AWTSMOOS_COMMENT_SHARD_SYNC=1 for synchronous diagnostics/migration.

Keep exports compatible:
- canUsePacked
- commentShardKey
- commentCoordinate
- writeCommentShardRecord
- deleteCommentShardRecord
- readCommentShardRecords
- listPackedCommentAuthors
- listPackedCommentVerseSections

## Tests after writing

- node -c modified files.
- node .awtsmoos-tmp/debug-comment-api-stress.mjs.

The Awtsmoos finalizes the path: the main comment body is the living heart; the packed mirror is only a reflection. A reflection must not chain the heart to a frozen lake.
