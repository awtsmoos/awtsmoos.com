B"H

# Safeguards design notes — packed import/read path

Companion to `geelooy/api/social/helper/safeguards/` (the code)
and its README (the rules). This file records the cache audit,
the loop/shed wiring, and two DESIGNS that are intentionally
**not implemented** — they need the user's explicit go-ahead.

## Cache discipline audit (Phase 2, 2026-10-20)

| Cache | Lives in | Invalidation discipline |
| --- | --- | --- |
| Grouped posts map | `packed/allPostsIndex.js` | Stat-validated (mtimeMs+size) on EVERY read; append-only growth tail-merged in place; **never cleared on writes** (`clearGroupedCache` keeps entries since Phase 2); one journaled rebuild only when the shard is replaced or shrinks |
| Grouped snapshot | `<allPosts shard>.grouped.json` | Watermark-checked, tail-merged forward (flap fix); a stale snapshot degrades to a rebuild, never to wrong data |
| listRecordsCache | `packed/socialPacked.js` | Same stat + tail-merge discipline (flap fix); `clearListRecordsCache` has NO production callers (tests/shutdown only) |
| Summaries cache | `routes/series/summariesCache.js` | 30 s TTL check; never writer-cleared; stale-while-revalidate under a read shed; concurrent cold callers share one recompute (in-flight registry) |
| Poison quarantine | `safeguards/poisonQuarantine.js` | Per-path error counts; 2+ errors quarantine the path — degraded reads instead of thrown reads (Phase 1) |

The invariant: **a write invalidates by making the next read
re-validate cheaply (stat), never by destroying shared state.**
Cache destruction on the write path is what turned one import
batch into a 197 MB rescan and a site flap.

## Loop protection (Phase 3, 2026-10-20)

- `safeguards/yieldEvery.js` — time-budget yield tick. Applied:
  the backlink grouping pass in `backlinksMixin.js` (the one
  fully-synchronous loop over a whole import queue). Workers
  already `yieldTick()` per parent group there, and import
  workers shed-pause on `shedNow()` (crash guards).
- Remaining known sync loops (grouped rebuild, tail merge) are
  chunked or incident-journaled; converting the rebuild to an
  async chunked walk is future work, gated on the import-process
  separation below (it removes the rebuild from the web loop's
  blast radius entirely).

## Read shed gate (Phase 3, 2026-10-20)

`safeguards/readShed.js` reuses admissionHealthy's overload
sensors (circuit breaker, heap headroom, OS free RAM) — never
the IMPORT_BUSY job check: reads must not 503 merely because an
import runs. When a verdict opens, heavy reads fail fast BEFORE
the heavy work:

- Series children listings (`readSubSeriesSummaries`): stale
  data if any exists, else a 503 `READ_SHED_OVERLOAD` envelope.
- Post lists (`/series/:series/posts` + `/posts/details` in
  `routes/posts/seriesRoutes.js`): 503 envelope immediately.
- Import `/start` keeps the full admission gate (crash guards).

Known gap: the series-details vessel in
`routes/series/readRoutes.js` (196 lines, pre-split legacy file)
gets its gate when that file is split under the standing
≤120-line program; its heavy half (packed merge) already
degrades through `safeRecordRead`.

## DESIGN ONLY — measuring watchdog (not implemented)

Problem: the current health watchdog restarts on probe
failures, but during a synchronous block its SIGTERM cannot be
processed (observed: SIGKILL after 15 s). It measures the
WRONG thing (an HTTP probe through the very loop that is stuck)
with no memory of near-misses.

Design sketch:

1. Three independent signals, none through the request path:
   in-process loop-lag p95 (eventLoopMonitor ring, exported via
   the pulse endpoint), an out-of-process HTTP probe, and OS
   free-RAM/disk trend from the resource alarm log.
2. Restart only on AGREEMENT: e.g. probe failed AND lag p95
   above threshold for 3 consecutive minutes, OR the process
   heartbeat file is older than 90 s. One bad probe never fires.
3. Every decision (fire / hold / why) appended as a line log —
   the watchdog explains itself after the fact.
4. The watchdog itself: tiny, no sync I/O on its hot path, its
   own heartbeat visible in the pulse payload.

## DESIGN ONLY — import-process separation (not implemented)

Problem: imports share the web process's single event loop and
1 GB heap, so any import pathology (fsync storm, giant parse)
is a site outage. Guards reduce this; separation removes it.

Design sketch:

1. A dedicated importer process owns the packed write path and
   the AwtsmoosDB write handles; the web process only admits
   jobs, reports status, and reads.
2. Narrow IPC: job specs in, progress/result lines out (the
   existing job store files are already the shared contract).
3. The importer gets its own heap cap and CPU nice level; its
   crash or OOM restarts alone, mid-job state resumes from the
   persisted job store (jobs are idempotent per postId).
4. Rollout: shadow mode (importer dry-runs alongside), then
   canary (one heichel), then default. Rollback = flip the
   admission target back to in-process.
5. Open questions: read-your-write visibility timing across
   processes (today's closeReadOnlyHandles trick is in-process),
   lock discipline on shared shard files, deploy ordering.

Neither design ships without the user's explicit word.
