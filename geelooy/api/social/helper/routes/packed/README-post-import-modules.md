B"H

# Post Import Module Map (postImportRoutes.js split, 2026-10-19)

`postImportRoutes.js` used to be a single 1,832-line file. It is now a slim
composition root (65 lines) plus focused modules, all in this directory.
Every module is under 120 lines, starts with the exact B"H header,
uses tab indentation, and carries full JSDoc. Behavior is unchanged —
the split was verified byte-for-byte equivalent in a local harness
(same exports, same prototype methods, same DB writes, same job results).

## Composition

`postImportRoutes.js` defines the class shell (constructor + `routes()`)
and mixes the route/job methods into the prototype via `Object.assign`.
Exports stay exactly: `{ PackedPostImportRoutes, contentHash,
normalizePost, canonicalBytes, deriveAliasId }`.

## Standalone modules (no `this`)

- **jobStore.js** — in-process job registry (Map, ids, concurrency count).
- **jobState.js** — on-disk job state (save/load/list, view shaping,
  restart survival; disk says `interrupted` for dead `running` jobs).
- **jobLog.js** — append-only JSONL job audit log + staged-upload root.
- **serverHealth.js** — event-loop yields + heap guards; imports must
  never starve live traffic.
- **importBounds.js** — size/count caps (OOM guards) + per-series mutex.
- **postValidate.js** — validation, pollution-safe clone, normalization,
  canonical bytes, content hash, alias-id derivation. The canonical form
  defines import idempotency.
- **tarball.js** — safe staged-tarball extraction (flat .json only,
  no path traversal, TAR_* error codes).
- **jobFactory.js** — `buildJob(o)`: every job field is born here.
- **startPosts.js** — resolves a start request's posts (staged or inline
  with caps); returns the route error object verbatim on failure.

## Mixins (methods on the class prototype)

- **authCoreMixin.js** — checkAuth / isOAuthOperator (fail closed).
- **authSignMixin.js** — Ed25519 signature verification per operation.
- **liveHashMixin.js** — live-hash lookups for idempotency (targeted
  O(1) lookups ONLY; full shard scans are forbidden).
- **aliasMixin.js** — commentator alias ids + alias record creation.
- **nativeWriteMixin.js** — the post writes: native DB first, packed
  mirror second. A crash between them self-heals via the skip check.
- **backlinksMixin.js** — deferred alias backlinks (queue + one
  parent-merged background flush after the job).
- **seriesAddsMixin.js** — series-index adds, flushed once at job end
  under the per-series mutex.
- **stageMixin.js** — readSpecPost / loadStagedPosts.
- **runJobMixin.js** — runJob entry: watchdog (600 s), live-hash cache,
  then delegates to runWorkers with a ctx object.
- **startMixin.js** — POST /posts/start route.
- **statusMixin.js** — status / jobs list routes.
- **cancelMixin.js** — cancel route (sets cancelRequested).
- **removeMixin.js** — single-post delete (owner-confirm header required).
- **verifyMixin.js** — verify job creation + verify-status.
- **runVerifyMixin.js** — verify engine (read-only hash comparison).
- **ensureBacklinksMixin.js** — backlink-repair job creation.
- **backlinksRepairMixin.js** — backlink-repair job body.
- **backlinksStatusMixin.js** — backlink status + sync flush routes.

## Job execution pipeline (runJob)

- **runJobWorkers.js** — worker pool drain, final flushes, terminal
  state, finalize block (kill-timer clear, state persist, backlinks).
- **processOnePost.js** — thin orchestrator: validate → write.
- **processOneValidate.js** — read spec entry, validate, normalize,
  alias, size cap, content hash (1% pre-hash re-verification).
- **processOneWrite.js** — idempotency skips, native write, alias
  ensure, backlink queue, batched mirror, series add, counters.
- **runJobBatch.js** — `flushPackedBatch(routes, $i, job)`: batched
  packed-mirror flush with per-post fallback on batch failure.

## AI safeguards — do not break these

1. **120-line law**: every file here stays ≤120 lines. The tunnel guard
   (osFs/lineLimitGuard.js) blocks violations on structured writes.
2. **Headers**: first three lines of every .js file are exactly
   `//B"H`, `//Blessed is He`, `//Boruch Hashem`. Tabs only. No minified
   code or comments, ever.
3. **Idempotency**: never change canonicalBytes/contentHash semantics;
   every past import's dedup depends on them.
4. **Write order**: native AwtsmoosDB record BEFORE the packed mirror.
   The reverse order caused permanent skips in production.
5. **No full shard scans** in the import path (3.9 GB shard — a scan
   stalled imports and starved the site). Targeted lookups only.
6. **Event-loop courtesy**: workers yield (yieldTick) and respect the
   heap guard and the 600 s time budget. Admin imports are never
   throttled by design (standing user order), but the budget exists.
7. **Backlinks are deferred**: the hot loop only queues; the flush is
   one parent-merged pass. Per-post backlink writes doubled import time.
8. **Series index**: accumulate during the job, flush ONCE at the end
   under the mutex. Mid-batch flushes lost updates.
9. **Exports**: the five exports of postImportRoutes.js are consumed
   across the codebase. Do not rename or drop any.
10. **Backups**: before any future refactor of these files, back up to
    /root/ with a timestamp (see /root/*-backup-split-20261020-*.js).
