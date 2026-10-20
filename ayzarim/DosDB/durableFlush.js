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
 */

"use strict";

const DURABLE_BATCH_WRITES = 25; // flush after this many pending writes
const DURABLE_BATCH_MS = 250; // or this many ms after the oldest pending

/** Per-file pending-flush state, keyed by absolute shard file path.
 * Value: { db, writes, firstAt, lastAt, timer }. @type {Map} */
const pendingByFile = new Map();
let sweepRegistered = false; // beforeExit sweep registered?

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
	const spent = st.writes >= DURABLE_BATCH_WRITES || (now - st.firstAt >= DURABLE_BATCH_MS);
	if (spent) return { flushed: doFlush(st), pending: 0 };
	if (!st.timer) {
		const wait = Math.max(1, st.firstAt + DURABLE_BATCH_MS - now);
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

module.exports = { DURABLE_BATCH_WRITES, DURABLE_BATCH_MS, requestDurableFlush, flushDurableNow };
