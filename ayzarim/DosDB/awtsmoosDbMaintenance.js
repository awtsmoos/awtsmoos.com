//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AwtsmoosDbMaintenance
 * @description
 * Throttled background maintenance for AwtsmoosDB family shards. Runs the
 * DB's full idle pipeline (retired-range promotion, verified free-space
 * complement refresh, free-list seal persistence, superblock, fsync) so the
 * free list self-heals during normal operation.
 *
 * B"H 2026-10-20 (free-space fix): the complement refresh adopts dead ranges
 * into the reusable free list. Before this, nothing in the production write
 * path ever ran it, so freed space was never reused and shard files grew
 * forever. This helper is called from the delayed-flush timer in the
 * adapter (off the request hot path) and never throws.
 */

/**
 * Map of DB file path to last maintenance timestamp (ms).
 * @type {Map<string, number>}
 */
const lastRunByFile = new Map();

/**
 * Runs db.waitForIdle() at most once per interval per DB file, and only
 * when the allocator flagged that a complement refresh is needed.
 * @param {object} db - AwtsmoosDB instance.
 * @param {string} file - DB file path (throttle key).
 * @param {number} [intervalMs] - minimum ms between runs for one file.
 * @returns {object} { ran } or { skipped, reason }.
 */
function maintainFreeSpaceThrottled(db, file, intervalMs = 300000) {
	if (!db || typeof db.waitForIdle !== 'function') {
		return { skipped: true, reason: 'no-waitForIdle' };
	}
	if (!db.allocator || db.allocator._needsComplementRefresh !== true) {
		return { skipped: true, reason: 'not-needed' };
	}
	const key = file || 'default';
	const now = Date.now();
	if (now - (lastRunByFile.get(key) || 0) < intervalMs) {
		return { skipped: true, reason: 'throttled' };
	}
	lastRunByFile.set(key, now);
	try {
		db.waitForIdle();
		return { ran: true };
	} catch (error) {
		console.error(
			'B"H AwtsmoosDB free-space maintenance failed',
			file,
			error && error.stack || error
		);
		return { ran: false, error: String(error && error.message || error) };
	}
}

module.exports = { maintainFreeSpaceThrottled };
