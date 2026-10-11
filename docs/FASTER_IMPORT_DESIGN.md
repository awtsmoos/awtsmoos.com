# B"H — Faster Future Import Path: Bottleneck Analysis + Design

**Date:** 2026-10-11
**Context:** Yaakov ordered (2026-10-11 ~18:29 EDT): figure out how to import FASTER in the future, in AwtsmoosDB format, once the current import lands and verifies working.
**Status of current import:** Igros Kodesh (11,062 posts) importing with the reworked parallel path; see throughput numbers below.

---

## 1. Measured bottlenecks (production, 2026-10-11)

### 1.1 Baseline: serial import job — ~7 records/sec
Measured on the original serial `runJob` loop (`postimport_mv4dvlb2_b5614c99`, 11,062 posts):
- 342 → 552 posts in 22.8s = **9.2 rec/s**
- 552 → 677 posts in 21.5s = **5.8 rec/s**
- Sustained average: **~7 rec/s** → 11,062 posts ≈ **26 minutes**

### 1.2 Per-post cost breakdown (in order of cost)
Each post in the serial loop does:
1. `readSpecPost` — `readFileSync` + `JSON.parse` of one staged file (~1ms; negligible)
2. `validatePost` + `normalizePost` + `canonicalBytes` + `contentHash` (SHA-256) — CPU, ~1–2ms
3. `writeOnePostBulk` — packed mirror write (sync, fast)
4. `ensureAlias` — `await $i.db.get` + occasional `await $i.db.write` (alias info/profile)
5. `writeNativePost` — **2× `await $i.db.write`** (the post record + the alias backlink)
6. `seriesAdd` — in-memory (flushed every 25 posts)
7. `await yieldTick()` — setImmediate (negligible)

**Dominant cost: the sequential `await`ed AwtsmoosDB writes (steps 4–5).**
The DB lives on `/mnt/HC_Volume_102267213` (network volume); every `await $i.db.write`
is a network round trip (~30–80ms). 3–4 round trips per post × 140ms ≈ the observed 7 rec/s.
The event loop sits idle waiting for I/O — pure serialization waste.

### 1.3 One-time per-job costs
- **Live-hash cache build** (`buildLiveHashCacheAsync`): ~45s streaming scan of the 3.9 GB
  core shard, once per job. For a 1,000-post chunk this is ~30% overhead; for 11k posts ~3%.
- **Staged upload**: tarball + signed chunks — fast (8 MB / 9 chunks / seconds). NOT a bottleneck.
- **Verify job**: server-side byte-exact read-back, ~9–10 rec/s (895 posts ≈ 95s). Acceptable; runs after import.

### 1.4 Structural limits found
- **One import job at a time**: `runningJob()` rejects concurrent `posts/start` with
  `JOB_ALREADY_RUNNING`. Parallelism must live *inside* the job, not across jobs
  (a start-race briefly allowed 2 concurrent jobs; one was later interrupted by a restart).
- **Verify jobs also block imports**: verify jobs register in the same `jobs` map with
  status `running`, so `posts/start` is rejected while any verify runs. Import and verify
  are otherwise independent — this is over-serialization worth fixing (§3.5).
- **Crash-between-writes hole (FIXED 2026-10-11)**: the old order wrote the packed mirror
  before the native record, and the skip check was packed-hash-only. A crash between the
  two left a post skipped-forever-but-missing-natively (observed: 1 post in production,
  repaired). Fix: native-first write order + native-existence check on the skip path.
- **Intermittent server restarts observed**: several import/verify jobs reported
  `interrupted` (in-memory job lost) mid-flight during 2026-10-11 ~18:20–18:55. The
  client's auto-resume (new job + idempotent skip) handled every case with zero data loss,
  but the restart cause is unknown — worth investigating separately.

---

## 2. What was already done (2026-10-11, live in production)

Commit `b369417ec` — `geelooy/api/social/helper/routes/packed/postImportRoutes.js`:

1. **Parallel worker pool in `runJob`** (8 workers, `AWTSMOOS_IMPORT_WORKERS` env override,
   max 16). Posts are independent (per-post keys); workers share the job's Maps/Sets,
   safe under the single-threaded event loop because every mutation is synchronous.
2. **Mutex-guarded series flush** + **snapshot+clear** in `flushSeriesAdds`, so concurrent
   workers can never lose a series-index entry (lost-update and clear-race both closed;
   verified by simulation: 1,000 posts, 8 workers, 0 missing posts, 0 missing series entries).
3. **Airtight idempotency**: skip-on-packed-hash now verifies the native record exists
   (`$i.db.get` on the skip path); missing natives fall through and re-write.
4. **Native-first write order**: native AwtsmoosDB record → alias → packed mirror.

Expected throughput: 8 workers × ~7 rec/s ≈ **40–55 rec/s** (I/O-overlapped),
11,062 posts in **~4 minutes** instead of ~26. Measured numbers to be appended below
once the current chunks land.

---

## 3. Faster future design (for the NEXT rework)

Goal: **1,000+ rec/s** — "almost instant" for 10k-post corpora. The ideas below are ordered
by payoff/effort. All preserve: byte-exact Hebrew, native AwtsmoosDB records, idempotency,
per-book verification.

### 3.1 Kill the per-post round trips (biggest win)
- **Bulk native write**: add `$i.db.writeMany([{path, value}])` (or check whether the
  AwtsmoosDB driver already batches). One round trip per 100–500 posts instead of 2 per post.
  Estimated: 10–20× on the write path alone.
- **Defer the packed mirror**: the packed shard is a *diagnostic* mirror, not the source of
  truth. Write it asynchronously in batches after the job (or drop it for bulk imports —
  `readPacked` already falls back to native). Removes 1 sync write per post from the hot loop.
- **Alias fast path**: `ensureAlias` does a `db.get` per post even when the alias is cached
  in `job.aliasCache` (the cache check is in-memory and already skips the I/O — keep this;
  just never let it leave the process).

### 3.2 Cache the live-hash scan across jobs
- `buildLiveHashCacheAsync` (~45s) runs per job. Persist it as
  `<dbRoot>/socialPacked/post-import-jobs/live-hashes-<heichel>.json` with a mtime/epoch,
  invalidate on any import write to that heichel. Chunked imports (6 × 1k posts) would share
  one scan instead of six.
- Even better: maintain an **incremental** hash index — the import job already knows every
  hash it wrote; merge into the persisted cache instead of rescanning.

### 3.3 Move hashing client-side
- `contentHash` (SHA-256 over canonical JSON) is CPU work the VM already does during
  staging (`vmImportStaged` reads every file). Ship `{postId, contentHash}` in the manifest;
  the server verifies by sampling (e.g., re-hash 1%) instead of hashing 100%.
  Removes ~1–2ms/post of server CPU and lets the skip check run before parsing.

### 3.4 Streaming ingest (replace stage→poll for large corpora)
- Keep the signed chunked `/stage` upload (it works, it's fast).
- Replace "start job → poll every 15s" with a **server-sent-events stream**: the job pushes
  `{postsDone, wrote, skipped, failed}` as it goes; the client gets live progress with zero
  polling overhead and can pipeline the next chunk's upload while the current chunk imports.

### 3.5 Allow bounded concurrent jobs (with disjoint series)
- Relax `runningJob()` to allow up to N (e.g., 4) concurrent import jobs, **provided** their
  series sets are disjoint (declare `seriesIds` in `posts/start`; reject overlaps with 409).
  Combined with in-job workers: 4 jobs × 8 workers ≈ 200+ rec/s on I/O-bound writes.
- Requires the series-flush race to stay closed (it is, post-§2) and the import lock to
  become a counter instead of a boolean.

### 3.6 Direct shard append for the packed mirror (if it stays)
- `writePacked` → `store.put` per record. For bulk, append pre-serialized envelopes to the
  shard stream in one `fs.appendFileSync` per batch. Only if the mirror stays on the hot path.

### 3.7 What NOT to do
- Don't parallelize across jobs by exploiting the start-race (fragile; caused an
  "interrupted" job when the server restarted mid-flight).
- Don't skip the verify pass — it's the only proof of byte-exactness, and it caught the
  1 missing native record.
- Don't batch different books into one job: per-book jobs keep series disjoint, logs clean,
  and resume granular.

---

## 4. Throughput log

| When | What | Records/s | Notes |
|---|---|---|---|
| 2026-10-11 ~18:16 | Serial `runJob`, 11,062 posts | ~7 | Baseline; 26 min projected |
| 2026-10-11 ~18:55 | 8-worker pool, chunk3 (1,143 fresh writes) | **18–22** | 1,143 wrote in ~65s of write time; 3× serial |
| 2026-10-11 ~18:52 | 8-worker pool, chunk1 (1,239 skips w/ native check) | ~37 skips/s | Skip path (packed hit + native `db.get`) |
| 2026-10-11 ~18:58 | chunk3 verify (1,143 posts) | ~14 | Server-side byte-exact read-back |

**Why only 3×, not 8×:** the 8 workers overlap the network round trips, but the
AwtsmoosDB driver and/or the `/mnt/HC_Volume` network volume serialize writes
somewhere below the Node event loop — workers queue behind each other on the actual
I/O. The remaining bottleneck is per-record write latency, not CPU or parallelism.
§3.1 (bulk native write — one round trip per 100–500 posts) is the next 10× lever.

## 5. Recommendation

Ship §2 now (done). For the next rework, do **§3.1 (bulk native write)** first — it attacks
the dominant cost directly and needs no protocol change. Then **§3.2 (shared hash cache)**
and **§3.4 (SSE progress)**. §3.5 (concurrent jobs) only after §3.1 proves stable.
