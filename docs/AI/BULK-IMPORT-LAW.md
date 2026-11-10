# Bulk Import Law — fast, batched, verified, never wedging the site

The packed import system exists so large imports do not take the site down.
It has failed at that before (2026-11-10: the main Node process event-loop
wedged during a packed-import job; the health watchdog SIGKILL-restarted
`awtsmoos.service` 7 times; nginx upstream timeouts across the whole site).
These rules are how it does not happen again.

## The targets (owner's bar, 2026-11-10)

- **< 100 ms server-side per post** for field-level updates (excluding network).
- **< 1 s acceptance** for an import job of any size: staged, receipted,
  guaranteed to process to completion.
- **Zero posts lost, every post verified.** A job is done when a post-by-post
  diff against live data comes back empty — not when the driver log says so.

## The mechanics you must use

- Routes: sync `POST /api/social/packed/import/posts/update` for bounded
  batches; staged post/update **jobs** (`/var/lib/awtsmoos/import-jobs`,
  stage dir `dayuhChadash/socialPacked/bulk-stage`) for large sets. Heichel for
  library imports is **`ikar`**.
- The update path must hold import batching for the whole request:
  `deferRefresh()` + `setImportBatching()` (durableFlush) +
  `setFs3ImportBatching()` (store), with `flushAllPending()` in a `finally`.
  Without this, every write pays a full FS3 flush — one flush on the
  production vessels measured **148,577 ms**. `IMPORT_BATCH_MS` in
  `ayzarim/DosDB/durableFlush.js` is 3,600,000 for exactly this reason; the
  `IMPORT_BATCH_WRITES` count trigger (2000) is the real flush cadence.
- Mirror writes are batched too (`mirrorPostsBulk`, flush the batch in a
  `finally`), never one sync mirror per post.
- **Never restart `awtsmoos.service` while an import is running**, and never
  start a heavy import while another session is mid-deploy. Several agent
  sessions share this server; coordinate in chat first. A restart mid-batch
  loses that batch's unflushed writes — recoverable only because imports are
  idempotent and re-verified (see below).
- Client timeout trap: Node's fetch (undici) aborts at **300 s**
  (`headersTimeout`) even with a 30-minute `AbortSignal`. Keep sync batches
  small enough to finish well under that (batches of 10–50 depending on post
  size), or drive with raw `http` and an explicit long socket timeout.
- Auth: the operator key (`AWTSMOOS_IMPORT_KEY`, in the service environment)
  makes the caller an admin for packed routes. Read it transiently from the
  process environment on the server if you must; **never print it, log it, or
  store it in a file or in git.**

## Verification is part of the import, not an extra

- Receipts and job counters **under-report** after timeouts/restarts (an
  interrupted update job in 2026-11-10 showed `postsDone: 0` while its
  receipts proved writes). Truth = live data: re-send the full update set
  through the update route — already-applied posts return `noop`, which
  *proves* the live diff is empty; missing ones apply now.
- Spot-verify content (e.g. leadins/overview length and text) on samples from
  every batch range, including the biggest posts and any range that crossed a
  restart or a client timeout.
- Watch the mirror: a post whose native write landed but whose mirror batch
  never flushed reads stale on mirror paths. If a range crossed an
  interruption, sample the public read path too, not only the native read.

## History that justifies this file

- Pre-fix update rate: 30–90 s/post (sync route paid full flush per post;
  update path never enabled batching at all).
- Post-fix measured: ~2.5 s/post under load for large docs on the JSONL
  mirror path; noop verification passes at ~65 ms/post on a warm process.
  The remaining write cost is the JSONL mirror + cache-nuking adapter
  behaviour documented in `KNOWN-PATHOLOGIES.md` — the AwtsmoosDB migration
  (`STORAGE-LAW.md`) is what removes it.
