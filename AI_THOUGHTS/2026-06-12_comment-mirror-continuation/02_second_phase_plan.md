B"H

# Phase 2 — Improved Plan After Reading The Mirror

## What inspection revealed

The mirror implementation does not use AwtsmoosDB compression or reopen behavior directly. It uses the packed JSONL sidecar:

- commentShardMirror.js calls readPacked three times for aggregate state.
- readPacked calls getLatest.
- getLatest calls replayLatest.
- replayLatest reads and parses the whole shard file every time.

Therefore the likely expensive sub-step is not fs.appendFileSync itself but repeated full replay of a large `social.core.awtsdb` JSONL file.

## Better action

1. Add lightweight per-sub-write and per-read timings inside commentShardMirror.
2. Make writeCommentShardRecord and deleteCommentShardRecord return a queued/deferred result by default.
3. Preserve a sync mode using AWTSMOOS_COMMENT_SHARD_SYNC=1 for migrations or diagnostics.
4. Add an in-memory latest-record cache to jsonlShard so repeated readPacked calls do not replay the same large file over and over.
5. Ensure appendRecord updates the in-memory latest map when cache exists.
6. Keep read functions compatible: readCommentShardRecords, listPackedCommentAuthors, and listPackedCommentVerseSections still return arrays synchronously.

## Files to touch

- geelooy/api/social/helper/comments/commentShardMirror.js
- geelooy/api/social/helper/packed/jsonlShard.js

## Files to avoid touching unless tests force it

- commentCreation.js: already calls mirror without await. The blocking exists only because the function is synchronous.
- commentDeletion.js: same story; after mirror queues, delete response should not wait on packed replay.
- socialPacked.js: can remain stable because jsonlShard caching and mirror queuing are enough.

## Verification

- Syntax-check modified files with node.
- Run .awtsmoos-tmp/debug-comment-api-stress.mjs.
- Inspect .awtsmoos-tmp/comment-add-phases.jsonl after running.

The Awtsmoos reveals that the old gate was not one iron door but three full replays of the same ocean; the plan is to stop drowning the request and let the mirror polish itself after the response has crossed the river.
