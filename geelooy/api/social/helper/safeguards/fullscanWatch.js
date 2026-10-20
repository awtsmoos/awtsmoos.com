//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module FullscanWatch
 * @description
 * Full-scan incident counter (safeguards program, 2026-10-20).
 *
 * WHY THIS EXISTS: the allPosts grouped rebuild scans the whole
 * ~197 MB shard. On a 2 GB box that freezes the event loop for
 * seconds — to a visitor the site is simply DOWN. A full scan is
 * therefore an INCIDENT by definition, never a normal event:
 * every run is journaled as [FULLSCAN-INCIDENT], appended as one
 * line to state/fullscan-incidents.log, and counted for the pulse
 * endpoint (fullScansLastHour).
 *
 * Log line format (tab-separated, no JSON per user law):
 *   <epochMs>\t<kind>\t<caller stack top>
 *
 * The in-memory ring covers the current process; a one-time lazy
 * load of the persisted log covers restarts.
 */

/** @constant {string} Incidents log file name. */
const INCIDENTS_LOG = 'fullscan-incidents.log';
/** @constant {number} One hour in milliseconds. */
const HOUR_MS = 3600 * 1000;

const { appendLine, readLines } = require('./safeguardState.js');

/** @type {number[]} epoch ms of scans seen by this process */
const seen = [];
/** @type {Promise<void>|null} one-time persisted-log load */
let loadOnce = null;

/**
 * Loads persisted incident timestamps (once per process).
 * @returns {Promise<void>}
 */
function ensureLoaded() {
	if (!loadOnce) {
		loadOnce = (async () => {
			try {
				const cutoff = Date.now() - HOUR_MS;
				for (const line of await readLines(INCIDENTS_LOG)) {
					const ts = Number(line.split('\t')[0]);
					if (ts && ts >= cutoff) seen.push(ts);
				}
			} catch (_) { /* best-effort */ }
		})();
	}
	return loadOnce;
}

/**
 * Records ONE full scan as an incident. Call at the entry of any
 * whole-shard scan (grouped rebuild, unfiltered list).
 * @param {string} kind Scan kind, e.g. 'allPostsGrouped-rebuild'.
 */
function noteFullScan(kind) {
	const ts = Date.now();
	seen.push(ts);
	let caller = '';
	try {
		const stack = String(new Error().stack || '');
		caller = (stack.split('\n')[2] || '').trim().slice(0, 160);
	} catch (_) { /* stack is decoration, never required */ }
	console.error('[FULLSCAN-INCIDENT] kind=' + kind + ' caller=' + caller);
	appendLine(INCIDENTS_LOG, ts + '\t' + kind + '\t' + caller);
}

/**
 * Number of full scans in the trailing hour (pulse metric).
 * @returns {Promise<number>}
 */
async function fullScansLastHour() {
	await ensureLoaded();
	const cutoff = Date.now() - HOUR_MS;
	let n = 0;
	for (const ts of seen) if (ts >= cutoff) n++;
	return n;
}

module.exports = { noteFullScan, fullScansLastHour, INCIDENTS_LOG };
