//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module StageLifecycle
 * @description Owns the death of staged bulk-upload directories.
 * Before this module existed, NOTHING ever removed a staged upload:
 * 543 directories / 346,946 files / 17.7 GB of `bulk-stage/` residue
 * accumulated between 2026-10-06 and 2026-10-18 (db-investigation 01).
 * Rules enforced here:
 *  - When a publishAll job reaches terminal `done` (never on
 *    failed / paused / cancelled / dry-run — those may resume), the
 *    EXTRACTED `files/` tree is deleted immediately. The tarball
 *    itself is kept for the grace window so an idempotent re-run
 *    with the same uploadId can re-extract and skip written posts.
 *  - `sweepStaleStages` removes any upload directory whose newest
 *    content is older than the grace window (default 7 days),
 *    except directories belonging to active jobs. Abandoned chunk
 *    uploads and crashed jobs are covered by the same sweep.
 *  - Every deletion is journaled to the job log. Nothing throws:
 *    lifecycle cleanup must never fail a request or a job.
 */

const fs = require('fs');
const path = require('path');
const { stageRoot, appendJobLog } = require('./jobLog.js');
/** Grace window: staged data untouched this long is residue. */
const STAGE_GRACE_MS = 7 * 24 * 60 * 60 * 1000;
/** Module-level throttle so the sweep runs at most hourly. */
let lastSweepAt = 0;

/**
 * Absolute path of one staged upload directory.
 * @param {object} $i - Awtsmoos request context (db root source).
 * @param {string} uploadId - staged upload id.
 * @returns {string} Directory path.
 */
function uploadDirOf($i, uploadId) {
	return path.join(stageRoot($i), String(uploadId));
}

/**
 * Newest mtime (ms) among a directory's immediate children.
 * @param {string} dir - directory to inspect.
 * @returns {number} Newest child mtime, or the dir's own mtime.
 */
function newestChildMtime(dir) {
	let newest = 0;
	try { newest = fs.statSync(dir).mtimeMs; } catch (_) { return 0; }
	let names = [];
	try { names = fs.readdirSync(dir); } catch (_) { return newest; }
	for (const name of names) {
		try {
			const m = fs.statSync(path.join(dir, name)).mtimeMs;
			if (m > newest) newest = m;
		} catch (_) { /* child vanished mid-scan; ignore */ }
	}
	return newest;
}

/**
 * Deletes the extracted files/ tree of a finished publishAll job.
 * Called from the job's finalizer; safe to call for any job (it
 * no-ops unless the job is a completed, non-dry-run publishAll).
 * @param {object} $i - Awtsmoos request context.
 * @param {object} job - finalized job record.
 * @returns {Promise<boolean>} True when a tree was removed.
 */
async function cleanupStageAfterJob($i, job) {
	try {
		if (!job || job.status !== 'done' || job.dryRun) return false;
		const spec = job.spec || {};
		if (spec.kind !== 'publishAll' || !spec.uploadId) return false;
		const filesDir = path.join(uploadDirOf($i, spec.uploadId), 'files');
		if (!fs.existsSync(filesDir)) return false;
		await fs.promises.rm(filesDir, { recursive: true, force: true });
		appendJobLog($i, {
			jobId: job.id, event: 'stage-files-cleaned', uploadId: spec.uploadId
		});
		return true;
	} catch (_) { return false; }
}

/**
 * Removes staged upload directories older than the grace window.
 * A directory is judged by its NEWEST child, so a chunked upload
 * still receiving parts is never touched; active jobs are skipped
 * by id. Throttled to one run per hour per process unless forced.
 * @param {object} $i - Awtsmoos request context.
 * @param {object} [opts] - { maxAgeMs, activeUploadIds, force }.
 * @returns {Promise<object>} { scanned, removed: [uploadId] }.
 */
async function sweepStaleStages($i, opts = {}) {
	const now = Date.now();
	if (!opts.force && now - lastSweepAt < 60 * 60 * 1000) {
		return { scanned: 0, removed: [], throttled: true };
	}
	lastSweepAt = now;
	const maxAgeMs = Number(opts.maxAgeMs) > 0 ? Number(opts.maxAgeMs) : STAGE_GRACE_MS;
	const active = new Set((opts.activeUploadIds || []).map(String));
	const root = stageRoot($i);
	const removed = [];
	let names = [];
	try { names = fs.readdirSync(root); } catch (_) { return { scanned: 0, removed }; }
	for (const name of names) {
		if (active.has(name)) continue;
		const dir = path.join(root, name);
		try {
			if (!fs.statSync(dir).isDirectory()) continue;
			if (now - newestChildMtime(dir) < maxAgeMs) continue;
			await fs.promises.rm(dir, { recursive: true, force: true });
			removed.push(name);
			appendJobLog($i, { event: 'stage-swept', uploadId: name });
		} catch (_) { /* one bad dir never stops the sweep */ }
	}
	return { scanned: names.length, removed };
}

module.exports = { STAGE_GRACE_MS, cleanupStageAfterJob, sweepStaleStages };
