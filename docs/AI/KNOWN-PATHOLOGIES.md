# Known Pathologies — measured traps in this codebase

Each entry was measured on the production server (2 CPUs, ~1.9 GB RAM,
swapping under load), not theorized. If you hit one, this file is the map;
if you fix one, update this file in the same commit.

## 1. Every write nukes the vessel's read caches

`awtsmoosDbFsAdapter.js`: after **every** write, the adapter unconditionally
calls `closeReadOnlyHandlesForFile()` + `clearReadCachesForFile()`. The
read-only handle cache in DosDB is keyed by seal `size:mtimeMs`, so in a
load → write → load loop **every load pays a full `AwtsmoosDB.open()`** on a
multi-GB fragmented vessel, and all read caches are perpetually cold during
imports. Measured: loading a 46 KB post took ~400 ms idle and up to
**10.9 s** under load, while the actual `readRange` + `deserializeBinary`
step is ~ms. DosDB already has per-path invalidation
(`invalidateFinalReadCacheFor()`) — the fix direction is per-path
invalidation on write, not wholesale handle closure. Also on every get:
a wasted array-sidecar probe (expects ENOENT), a 2-byte magic re-check of
the vessel via open/read/close, and `routedLooksLikeBrokenCollection()`
running a second routed `getObjectKeys` — a collection-migration guard
applied to single-file reads.

## 2. FS3 flush = whole child-map rewrite (~150 s)

`durableFlush.js`: a flush rewrites the vessel's entire child map with
~3 fsyncs. Measured on production vessels: **148,577 ms** for one flush.
Consequences: imports must batch durability (see `BULK-IMPORT-LAW.md`), and
the adapter's 5-minute timer also fires `maintainFreeSpaceThrottled()` →
`waitForIdle()` complement refresh, which can stall a request for minutes.
Tail-latency spikes during imports are usually this, not your code.

## 3. One process, one event loop

Everything — HTTP, imports, Drive downloads, tunnel control — runs on the
single main Node process. Synchronous heavy work wedges **all** routes
(2026-11-10 tunnel incident: packed-import payloads stalled the loop,
watchdog SIGKILL-restarted the service 7 times, tunnel + site down
together). Yield in loops (`setImmediate` per post), keep per-request work
small, and never run a second heavy in-process job alongside an import.

## 4. Double native write per post

`nativeWriteMixin.js writeNativePostOnly()` writes the full native document
**twice** — series path and heichel path, two FS3 vessels. Until that is
rationalized, every post update costs 2× vessel writes plus mirrors.

## 5. Packed mirror legacy traps (being migrated off — see STORAGE-LAW.md)

- `readPacked()` stream-parses the whole shard per point read. Use
  `keyIndexRead.js findIndexed()` (O(1) offset read) where a point read is
  needed.
- `mirrorPostsBulk()` does not call `noteWrite`, so the `.keyidx.json`
  sidecar lags the data file until a tail-scan catch-up. Do not treat the
  sidecar as complete during/after bulk mirror writes.
- Staged update-jobs historically rejected `updates.jsonl` in the tarball
  whitelist while the job format required it — check `tarball.js` whitelist
  before assuming a stage is malformed.

## 6. The box itself

2 CPUs, ~1.9 GB RAM, swap in use when several sessions work at once. A
"gentle" background walk at 12 concurrent requests saturated it and had to
be shut down (2026-11-10). External checks: ≤3–4 concurrent, ≥200 ms
pacing. Large in-memory folds of the 15.6 GB shard OOM-killed a worker
once — stream, never slurp.
