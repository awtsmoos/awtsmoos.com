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
 */

const fs = require('node:fs');
const path = require('node:path');
const { jobStoreDirs, receiptsPathForDir } = require('./jobStorePaths.js');
const { safeJobId } = require('./jobStatePaths.js');

const RECEIPT_STATUSES = new Set(['wrote', 'updated', 'skipped', 'failed']);

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
	try {
		fs.mkdirSync(path.dirname(file), { recursive: true });
		fs.appendFileSync(file, JSON.stringify(line) + '\n');
		return true;
	} catch (_) {
		return false;
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

/** Stream every receipt line for a job id, in file order. */
function readReceipts($i, id, options = {}) {
	const file = findReceiptsFile($i, id);
	if (!file) return [];
	const out = [];
	let text;
	try { text = fs.readFileSync(file, 'utf8'); } catch (_) { return []; }
	for (const line of text.split('\n')) {
		if (!line) continue;
		try { out.push(JSON.parse(line)); } catch (_) { /* skip a torn line */ }
	}
	if (options.status) return out.filter(r => r.status === options.status);
	return out;
}

/** One page of receipts plus the total line count (1-based page). */
function readReceiptsPage($i, id, page = 1, perPage = 100) {
	const all = readReceipts($i, id);
	const safePage = Math.max(1, Math.floor(page) || 1);
	const safePer = Math.min(500, Math.max(1, Math.floor(perPage) || 100));
	const start = (safePage - 1) * safePer;
	return {
		receipts: all.slice(start, start + safePer),
		page: safePage,
		perPage: safePer,
		total: all.length,
		pages: Math.max(1, Math.ceil(all.length / safePer))
	};
}

/** Count receipts by status without loading post bodies. */
function summarizeReceipts($i, id) {
	const summary = { wrote: 0, updated: 0, skipped: 0, failed: 0, total: 0, failedPostIds: [], failedErrors: {} };
	for (const r of readReceipts($i, id)) {
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

/** The set of postIds already resolved by receipts (wrote/updated/skipped). */
function donePostIdsFromReceipts($i, id) {
	const done = new Set();
	for (const r of readReceipts($i, id)) {
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
	summarizeReceipts
};
