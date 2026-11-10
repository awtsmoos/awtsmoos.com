# Storage Law — AwtsmoosDB only. No JSON as a database. Ever.

Owner's rule, 2026-11-10, stated repeatedly and finally: **all hot data lives in
AwtsmoosDB. JSON and JSONL are banned as storage mechanisms.** Not "prefer
AwtsmoosDB" — banned. If you are about to create a `.jsonl` store, a
`state.json` that gets rewritten at runtime, or an append-only log file that
something later has to parse, stop and use AwtsmoosDB instead.

## Why JSONL died (measured, 2026-11-10)

The packed social shards (`social.core.awtsdb`, `social.allPosts.awtsdb`,
`social.meta.awtsdb` under `dayuhChadash/socialPacked/`) were append-only JSONL:

- Every edit appended a **brand-new full copy** of the document
  (`socialPackedCore.js writeFileRecord()` = `fs.appendFileSync` of the whole
  record). Deletes were tombstone appends. "Last line wins" was only a
  read-time fold; superseded bytes were never reused or reclaimed.
- The format has **no allocator** — no free list, no slots, no rewrite path.
- `helper/packed/compactor.js compactShard()` only ever returned a census
  (`skipped: true, reason: 'logical_key_report'`). Its real rewrite was removed
  after an OOM kill and never re-attempted. No job, timer, or trigger anywhere
  reclaimed space.
- Result, measured by full streaming census: `social.core.awtsdb` was
  15,630,353,458 bytes with only 7,588,002,053 live — **51.5% dead (8.04 GB)**.
  allPosts 46.5% dead, meta 48.8% dead. Dead space is not a bug in that design;
  it is the design's only possible outcome.
- Point reads were just as bad: `readPacked()` stream-parsed the entire
  15.6 GB file per read, even though an O(1) index reader
  (`keyIndexRead.js findIndexed()`) existed and was barely used.

## Why state.json died (measured, 2026-11-10)

The Drive public-download path kept alias state in a `state.json` (~900 KB).
Every download ran begin+finish accounting, each a lockfile + full-file
rewrite + fsync — two locked full rewrites per file, serialized per alias,
plus a 4-wide concurrent-transfer lease cap that threw
`CONCURRENT_TRANSFER_LIMIT_EXCEEDED` (HTTP 429) on the 5th parallel download.
Same-server files took 5–38 s. Fixed 2026-11-10 (commit `8ff3b17e4`): public
reads take no lease, one accounting mutation per download, 304 before body
read, immutable cache headers — 5–17 ms after. The lesson stands: **a JSON
file that runtime code rewrites is a lock convoy waiting to happen.**

## Why AwtsmoosDB is the answer

- Paged allocator (FS3) opened with `reuseFreedSpace: 'verified'`
  (`awtsmoosDbFsAdapter.js openAwtsmoosDb`, `shardStore.js openDb`): freed
  ranges are recycled, so a vessel's growth is bounded by **live data**, not by
  edit count. Dead space cannot accumulate by construction.
- It has the self-healing loop JSONL never got:
  `awtsmoosDbMaintenance.js maintainFreeSpaceThrottled()` → `db.waitForIdle()`
  (complement refresh, free-list seal), driven by the adapter's flush timer.
  (The vessels had the identical grow-forever disease until 2026-10-20, when
  this loop was attached.)
- Binary records with key indexes: point reads are offset reads, not
  file parses. Batching hooks exist for imports (`durableFlush`
  `setImportBatching`, store `deferRefresh` / `setFs3ImportBatching`).

## The rules

1. New data store needed? Create an AwtsmoosDB vessel under the appropriate
   `dayuhChadash/` root. Never a JSON/JSONL file.
2. Existing JSONL shard code is legacy being migrated off. Do not add new
   writers to it; do not "fix" it by compacting harder — migrate the shard.
3. JSON is fine as a *wire format* and for static config that ships in git and
   is never rewritten at runtime. It is not fine as a database.
4. Secrets never live in this repo (see root `AGENTS.md`); runtime state never
   lives in git-tracked files.
