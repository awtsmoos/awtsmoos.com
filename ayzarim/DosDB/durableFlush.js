//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module DurableFlush
 * @description Batched durability for AwtsmoosDB FS3 shared write handles.
 * Why: the 2026-10-20 stale-read fix ("flushNow") made EVERY adapter
 * write/delete/rename call db.fs.flush() synchronously, and flush() ends
 * in forceDurableBoundary() = ~3 fsyncSync + ftruncate on multi-GB
 * shards. A 25-post batch paid 225-375 sync fsyncs on the event-loop
 * thread; the watchdog's SIGTERM went unprocessed until SIGKILL. The
 * older design flushed once per 5 minutes: cheap, but updates stayed
 * invisible to read-only handles and were lost on restart. (Evidence:
 * crash-investigation/02-fsync-storm.md.) Middle ground:
 * requestDurableFlush(db, file) runs after every write and flushes
 * IMMEDIATELY when a budget is spent (DURABLE_BATCH_WRITES on that
 * that file, or DURABLE_BATCH_MS since the oldest pending write), else
 * arms one unref'd timer for the deadline. Staleness AND crash loss are
 * bounded by one micro-batch per file (<=25 writes, <=250ms); jobs are
 * idempotent per postId, so a lost micro-batch is re-written on resume.
 * Visibility of LANDED posts is untouched: the adapter still closes
 * read-only handles after every write. A beforeExit sweep flushes
 * pending state on clean shutdown (SIGKILL cannot be swept — exactly
 * the bounded-loss case). scheduleSharedFlush remains the backstop.
 *
 * Nov 10 speed fix (E) — import batching: the 25-write budget is the
 * wrong shape for a bulk import. Every FS3 flush re-writes the whole
 * directory child-map object (O(directory size) per flush), so at
 * 2,000 keys a flush costs ~10,000 allocates and a 25-write budget
 * charges ~400 allocates ( ~400ms) to every post — the measured FS3
 * rate on a seeded store was ~2.5 posts/sec with the 25-write budget
 * (fixes B/C/D in place). An import job therefore widens the budget
 * for its whole run (setImportBatching, refcounted so concurrent jobs
 * nest) and flushes everything once at the end (flushAllPending, in
 * the job's finally, before it reports done). The widened budget is
 * 2,000 writes / 60s: a 2,000-post job flushes once, at the end, and
 * the child-map is re-written once for the whole job instead of once
 * per 25 posts. Crash loss is bounded by the job's idempotency (a
 * lost batch is re-written on resume — the job re-checks the live
 * store, it does not trust receipts alone), and the job-end flush
 * means a job that reports "done" has its data durable. The 25/250
 * defaults are unchanged for every other writer.
 */

"use strict";

const DURABLE_BATCH_WRITES = 25; // flush after this many pending writes
const DURABLE_BATCH_MS = 250; // or this many ms after the oldest pending

// Nov 10 (E): the widened budget an import job runs under. 2,000
// writes covers a whole Midrashim work (largest: 1,008 posts) in one
// batch; 60s is the backstop so a slow job still flushes mid-run.
const IMPORT_BATCH_WRITES = 2000;
const IMPORT_BATCH_MS = 60000;

/** Per-file pending-flush state, keyed by absolute shard file path.
 * Value: { db, writes, firstAt, lastAt, timer }. @type {Map} */
const pendingByFile = new Map();
let sweepRegistered = false; // beforeExit sweep registered?

// Nov 10 (E): refcount of import jobs currently running under the
// widened budget. >0 means requestDurableFlush uses the import
// limits; 0 means the 25/250 defaults. Refcounted (not boolean) so
// concurrent jobs on different heichels nest and the last one out
// restores the defaults.
let importBatchDepth = 0;

/** The batch limits in force right now (import limits while any import job runs, else the defaults). */
function batchLimits() {
	return importBatchDepth > 0
		? { writes: IMPORT_BATCH_WRITES, ms: IMPORT_BATCH_MS }
		: { writes: DURABLE_BATCH_WRITES, ms: DURABLE_BATCH_MS };
}

/**
 * Widen the durability budget for an import job's run. Refcounted:
 * call once per job start, and clearImportBatching() once per job
 * end (in a finally). While any job holds it, every file flushes at
 * most once per 2,000 writes / 60s instead of once per 25 writes /
 * 250ms — the child-map rewrite that dominates the FS3 write cost is
 * then amortized over the whole job instead of charged per post.
 */
function setImportBatching() {
	importBatchDepth++;
}

/**
 * Release one import job's widened budget. When the count reaches
 * zero the 25/250 defaults return. Never goes below zero.
 */
function clearImportBatching() {
	if (importBatchDepth > 0) importBatchDepth--;
}

/**
 * Run the synchronous flush for one file's state, reset its counters.
 * Errors are logged, never thrown (the backstop retries durability).
 * @param {object} st The per-file state record.
 * @returns {boolean} True if flush() ran without throwing.
 */
function doFlush(st) {
	if (st.timer) { clearTimeout(st.timer); st.timer = null; }
	const db = st.db;
	st.writes = 0;
	st.firstAt = 0;
	st.lastAt = Date.now();
	try {
		if (db && db.fs && typeof db.fs.flush === "function") db.fs.flush();
		return true;
	} catch (error) {
		console.error("B\"H AwtsmoosDB batched fs flush failed", error && error.stack || error);
		return false;
	}
}

/** Register the one-time beforeExit sweep flushing all pending files. */
function registerSweep() {
	if (sweepRegistered) return;
	sweepRegistered = true;
	process.on("beforeExit", () => {
		for (const st of pendingByFile.values()) {
			if (st.writes > 0) doFlush(st);
		}
	});
}

/**
 * Request a durability flush after a write/delete/rename. Flushes
 * synchronously when a budget is spent, else arms the deadline timer.
 * Never throws.
 * @param {object} db The shared AwtsmoosDB handle for the file.
 * @param {string} file Absolute shard file path (batching key).
 * @returns {{flushed: boolean, pending: number}} What happened.
 */
function requestDurableFlush(db, file) {
	registerSweep();
	const key = file || "__no_file__";
	let st = pendingByFile.get(key);
	if (!st) {
		st = { db, writes: 0, firstAt: 0, lastAt: 0, timer: null };
		pendingByFile.set(key, st);
	}
	if (db) st.db = db;
	const now = Date.now();
	if (!st.firstAt) st.firstAt = now;
	st.writes++;
	const limits = batchLimits();
	const spent = st.writes >= limits.writes || (now - st.firstAt >= limits.ms);
	if (spent) return { flushed: doFlush(st), pending: 0 };
	if (!st.timer) {
		const wait = Math.max(1, st.firstAt + limits.ms - now);
		st.timer = setTimeout(() => { st.timer = null; doFlush(st); }, wait);
		if (typeof st.timer.unref === "function") st.timer.unref();
	}
	return { flushed: false, pending: st.writes };
}

/**
 * Flush one file's pending writes immediately, regardless of budget
 * (job-end hooks, explicit durability checkpoints).
 * @param {object} db The shared AwtsmoosDB handle for the file.
 * @param {string} file Absolute shard file path (batching key).
 * @returns {boolean} True if a flush ran.
 */
function flushDurableNow(db, file) {
	const st = pendingByFile.get(file || "__no_file__");
	if (st) { if (db) st.db = db; return doFlush(st); }
	try {
		if (db && db.fs && typeof db.fs.flush === "function") db.fs.flush();
		return true;
	} catch (error) {
		console.error("B\"H AwtsmoosDB immediate fs flush failed", error && error.stack || error);
		return false;
	}
}

/**
 * Flush every file that has pending writes right now, regardless of
 * budget. This is the job-end durability checkpoint: an import job
 * calls it in its finally (before it reports done) so a job that
 * says "done" has its data durable, even though the widened import
 * budget would otherwise leave the last batch unflushed until its
 * 60s timer. Never throws; a file whose flush fails is left pending
 * for the backstop (its timer / the beforeExit sweep).
 * @returns {number} How many files were flushed.
 */
function flushAllPending() {
	let flushed = 0;
	for (const st of pendingByFile.values()) {
		if (st.writes > 0 && doFlush(st)) flushed++;
	}
	return flushed;
}

module.exports = {
	DURABLE_BATCH_WRITES,
	DURABLE_BATCH_MS,
	IMPORT_BATCH_WRITES,
	IMPORT_BATCH_MS,
	requestDurableFlush,
	flushDurableNow,
	setImportBatching,
	clearImportBatching,
	flushAllPending
};
