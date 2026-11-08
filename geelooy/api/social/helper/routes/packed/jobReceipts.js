//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file jobReceipts.js
 * @description
 * Bulk-upload redesign §3.3/§3.6: append-only per-post receipts.
 * Every post a job touches gets one durable line in
 * <jobId>.receipts.jsonl inside the job store:
 *   { postId, hash, status, error?, at, dryRun? }
 * status is one of: wrote | updated | skipped | failed.
 * The per-job state JSON stays constant-size (counters only); the
 * receipts file is the durable per-post truth that resume,
 * retry-failed-only, status, and verification all read from.
 * Receipts are written under the job's LINEAGE id (job.resumeOf || job.id)
 * so a resumed attempt extends the same receipt history instead of
 * starting a second one. Appends are O(1); the file is fsynced when the
 * job reaches terminal state (see closeReceipts).
 *
 * Nov 8 instant pass:
 * - appendReceipt no longer runs mkdirSync on every append (measured
 *   95 ms vs 55 ms per 10,000 appends): it appends first and only
 *   creates the directory on ENOENT, then retries once.
 * - Reads STREAM the file line by line (64 KB chunks, bounded memory)
 *   instead of readFileSync + split + JSON.parse of the whole file.
 *   A 100,000-line receipts file used to cost ~150 ms and a ~120 MB
 *   RSS spike on EVERY status poll (summarize + page = two full reads);
 *   status, resume, and verify now read in O(page) / O(1) memory.
 */

const fs = require('node:fs');
const path = require('node:path');
const { jobStoreDirs, receiptsPathForDir } = require('./jobStorePaths.js');
const { safeJobId } = require('./jobStatePaths.js');

const RECEIPT_STATUSES = new Set(['wrote', 'updated', 'skipped', 'failed']);
const RECEIPT_READ_CHUNK_BYTES = 64 * 1024;

/** The lineage id whose receipts file a job (or attempt) writes to. */
function receiptsId(job) {
	return (job && job.resumeOf) || (job && job.id) || null;
}

/** Locate the receipts file for a job id, searching primary then legacy store. */
function findReceiptsFile($i, id) {
	const safe = safeJobId(id);
	if (!safe) return null;
	for (const dir of jobStoreDirs($i)) {
		const file = receiptsPathForDir(dir, safe);
		try {
			if (fs.existsSync(file)) return file;
		} catch (_) { /* try next dir */ }
	}
	return null;
}

/** The path a new receipt line for this job would be appended to. */
function receiptsPath($i, job) {
	const id = safeJobId(receiptsId(job));
	if (!id) return null;
	return receiptsPathForDir(jobStoreDirs($i)[0], id);
}

/**
 * Append one receipt line. Best-effort by design: a receipt failure must
 * never fail the post write it records — the counters in the state file
 * remain the fallback. Returns true when the line landed.
 * The directory is created only when the append fails with ENOENT (the
 * first receipt of a job), never on every append.
 */
function appendReceipt($i, job, receipt) {
	const file = receiptsPath($i, job);
	if (!file) return false;
	const line = {
		postId: String(receipt.postId || ''),
		hash: receipt.hash || null,
		status: RECEIPT_STATUSES.has(receipt.status) ? receipt.status : 'failed',
		error: receipt.error || undefined,
		at: receipt.at || Date.now(),
		dryRun: receipt.dryRun ? true : undefined
	};
	const text = JSON.stringify(line) + '\n';
	try {
		fs.appendFileSync(file, text);
		return true;
	} catch (error) {
		if (!error || error.code !== 'ENOENT') return false;
		try {
			fs.mkdirSync(path.dirname(file), { recursive: true });
			fs.appendFileSync(file, text);
			return true;
		} catch (_) {
			return false;
		}
	}
}

/** Fsync the receipts file so terminal truth is durable (best-effort). */
function closeReceipts($i, job) {
	const file = findReceiptsFile($i, receiptsId(job)) || receiptsPath($i, job);
	if (!file) return false;
	try {
		const fd = fs.openSync(file, 'r');
		try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
		return true;
	} catch (_) {
		return false;
	}
}

/**
 * Yield parsed receipt objects one at a time, in file order, without
 * loading the file. Memory is O(longest line), not O(file). A torn line
 * is skipped, as the old whole-file reader did. Breaking out early
 * closes the file descriptor (generator finally).
 */
function* streamReceipts($i, id) {
	const file = findReceiptsFile($i, id);
	if (!file) return;
	let fd;
	try { fd = fs.openSync(file, 'r'); } catch (_) { return; }
	const buf = Buffer.alloc(RECEIPT_READ_CHUNK_BYTES);
	let tail = '';
	try {
		let n;
		while ((n = fs.readSync(fd, buf, 0, buf.length, null)) > 0) {
			tail += buf.toString('utf8', 0, n);
			let idx;
			while ((idx = tail.indexOf('\n')) >= 0) {
				const line = tail.slice(0, idx);
				tail = tail.slice(idx + 1);
				if (!line) continue;
				try { yield JSON.parse(line); } catch (_) { /* skip a torn line */ }
			}
		}
		if (tail) {
			try { yield JSON.parse(tail); } catch (_) { /* skip a torn line */ }
		}
	} catch (_) { /* unreadable mid-stream: stop, as the old reader did */ } finally {
		try { fs.closeSync(fd); } catch (_) { /* ignore */ }
	}
}

/** Read every receipt line for a job id, in file order (materialized array). */
function readReceipts($i, id, options = {}) {
	const out = [];
	for (const r of streamReceipts($i, id)) {
		if (!options.status || r.status === options.status) out.push(r);
	}
	return out;
}

/** One page of receipts plus the total line count (1-based page). Streams: only the page is retained. */
function readReceiptsPage($i, id, page = 1, perPage = 100) {
	const safePage = Math.max(1, Math.floor(page) || 1);
	const safePer = Math.min(500, Math.max(1, Math.floor(perPage) || 100));
	const start = (safePage - 1) * safePer;
	const receipts = [];
	let total = 0;
	for (const r of streamReceipts($i, id)) {
		if (total >= start && total < start + safePer) receipts.push(r);
		total++;
	}
	return {
		receipts,
		page: safePage,
		perPage: safePer,
		total,
		pages: Math.max(1, Math.ceil(total / safePer))
	};
}

/** Count receipts by status without loading post bodies (streams). */
function summarizeReceipts($i, id) {
	const summary = { wrote: 0, updated: 0, skipped: 0, failed: 0, total: 0, failedPostIds: [], failedErrors: {} };
	for (const r of streamReceipts($i, id)) {
		if (!RECEIPT_STATUSES.has(r.status)) continue;
		summary[r.status]++;
		summary.total++;
		if (r.status === 'failed') {
			if (summary.failedPostIds.length < 100) summary.failedPostIds.push(r.postId);
			if (r.error && !summary.failedErrors[r.postId]) summary.failedErrors[r.postId] = String(r.error).slice(0, 300);
		}
	}
	return summary;
}

/** The set of postIds already resolved by receipts (wrote/updated/skipped). Streams; only the id set is retained. */
function donePostIdsFromReceipts($i, id) {
	const done = new Set();
	for (const r of streamReceipts($i, id)) {
		if (r.status === 'wrote' || r.status === 'updated' || r.status === 'skipped') done.add(String(r.postId));
	}
	return done;
}

/** The failed receipt lines for a job id, in file order. */
function failedReceipts($i, id) {
	return readReceipts($i, id, { status: 'failed' });
}

module.exports = {
	RECEIPT_STATUSES,
	appendReceipt,
	closeReceipts,
	donePostIdsFromReceipts,
	failedReceipts,
	findReceiptsFile,
	readReceipts,
	readReceiptsPage,
	receiptsId,
	receiptsPath,
	streamReceipts,
	summarizeReceipts
};
