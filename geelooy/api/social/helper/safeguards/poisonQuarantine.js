//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module PoisonQuarantine
 * @description
 * Poison-record quarantine for the safeguards program (2026-10-20).
 *
 * WHY THIS EXISTS: a single corrupt record (a directory where a
 * file was expected, a half-written blob, a bad parse) must never
 * cost the server a second full failure. The first error is logged
 * and skipped; the SECOND error on the same path quarantines it —
 * later reads skip it entirely without touching the bad record.
 *
 * STORAGE: append-only text lines (no JSON, per user law).
 *  - poison-counts.log    : "<epochMs>\t<count>\t<errCode>\t<path>"
 *  - poison-quarantine.log: "<epochMs>\t<path>"   (one line per path)
 * In-memory Maps are the hot path; files make quarantine survive
 * a restart. Everything here is best-effort and never throws.
 */

/** @constant {number} Errors on one path before quarantine bites. */
const QUARANTINE_AFTER = 2;
/** @constant {string} Counts log file name. */
const COUNTS_LOG = 'poison-counts.log';
/** @constant {string} Quarantine set log file name. */
const QUARANTINE_LOG = 'poison-quarantine.log';

const { appendLine, readLines } = require('./safeguardState.js');

/** @type {Map<string, number>} error count per path (hot path) */
const counts = new Map();
/** @type {Set<string>} quarantined paths (hot path) */
const quarantined = new Set();
/** @type {Promise<void>|null} One-time load of the persisted set. */
let loadOnce = null;

/**
 * Loads persisted quarantined paths (once per process).
 * @returns {Promise<void>}
 */
function ensureLoaded() {
	if (!loadOnce) {
		loadOnce = (async () => {
			try {
				for (const line of await readLines(QUARANTINE_LOG)) {
					const p = line.split('\t').slice(1).join('\t');
					if (p) quarantined.add(p);
				}
			} catch (_) { /* best-effort: empty set is a safe start */ }
		})();
	}
	return loadOnce;
}

/**
 * True when the path is quarantined (bad record, skip without reading).
 * @param {string} path Record path.
 * @returns {Promise<boolean>}
 */
async function isQuarantined(path) {
	await ensureLoaded();
	return quarantined.has(path);
}

/**
 * Records one error on a path. At QUARANTINE_AFTER errors the path
 * joins the quarantine set and is persisted for future restarts.
 * @param {string} path Record path.
 * @param {string} errCode Short error code (EISDIR, EPARSE, SHAPE, ...).
 * @returns {Promise<boolean>} True when the path is now quarantined.
 */
async function notePoison(path, errCode) {
	await ensureLoaded();
	const count = (counts.get(path) || 0) + 1;
	counts.set(path, count);
	console.error('[POISON] path=' + path + ' err=' + errCode + ' count=' + count);
	appendLine(COUNTS_LOG, Date.now() + '\t' + count + '\t' + errCode + '\t' + path);
	if (count >= QUARANTINE_AFTER && !quarantined.has(path)) {
		quarantined.add(path);
		appendLine(QUARANTINE_LOG, Date.now() + '\t' + path);
		console.error('[QUARANTINE] path=' + path + ' quarantined after ' + count + ' errors');
		return true;
	}
	return false;
}

/**
 * Error count seen for a path this process lifetime.
 * @param {string} path Record path.
 * @returns {number}
 */
function poisonCount(path) {
	return counts.get(path) || 0;
}

module.exports = { notePoison, isQuarantined, poisonCount, QUARANTINE_AFTER };
