B"H

# Plan — No Duplicate Comment Mirror

User clarified: comments should not be copied into any packed mirror. The JSONL-backed packed sidecar was the wrong target to optimize. The clean fix is to remove comment write/delete dependence on commentShardMirror and ensure get/edit/delete use authoritative comments storage only.

## Phase 1
- Trace get/edit/delete code paths.
- Find live reads of readCommentShardRecords/listPackedCommentAuthors/listPackedCommentVerseSections.
- Identify whether any route depends on packed mirror for correctness.

## Phase 2
- Remove mirror writes from comment creation and deletion.
- Keep or replace commentShardMirror exports only if other modules import them, but make write/delete no-op or unused.
- Fix any read path that falls back to packed mirror by routing through authoritative DosDB paths.

## Phase 3
- Run syntax checks.
- Run existing stress harness for add/reply/get/edit/delete.
- Inspect failures and fix actual authoritative path bugs first.

No partial patches. Rewrite complete files that are modified.
