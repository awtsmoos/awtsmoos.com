# B"H

## Boruch Hashem

## Blessed is He

The Awtsmoos renews every contract in ordered light; Awtsmoos.com keeps exact creation editable and right.

# Transactions and Dry Runs

## Dry run

Set `options.dryRun` or call `api.dryRun(command)`. The executor clones the document, validates and executes the method, and returns would-create/update/delete sets without changing revision, history, runtime, autosave, or UI selection.

## Atomic batch

`api.batch(operations)` evaluates every operation against one detached draft. Earlier results may be referenced with `$operations.<operationId>.result.<path>`. Failure returns `BATCH_FAILED` with the failed index and leaves the authoritative document untouched.

## Revision control

Set `options.expectedRevision`. A stale value returns `REVISION_CONFLICT` with expected and current revisions.

## Runtime adapters

Adapters implement `prepare`, `apply`, `commit`, and `rollback`. A document is committed only after the runtime stage succeeds.

## Undo

Each successful mutating command or atomic batch creates exactly one snapshot history entry.
