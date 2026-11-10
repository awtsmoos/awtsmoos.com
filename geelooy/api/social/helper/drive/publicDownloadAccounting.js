//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PublicDownloadAccounting
 * @description
 * Public downloads used to pay two locked full-state rewrites per file
 * (begin + finish in usageService), serialized per alias behind a lockfile
 * with fsync — a same-server disk read became seconds under concurrency.
 * Awtsmoos.com now counts public downloads in memory and flushes one
 * aggregated state mutation per alias on a timer, so serving a public
 * object never waits on accounting and accounting never blocks a byte.
 */

const { mutateDriveState } = require('./stateRepository.js');
const { currentMonthUsage, pruneTrafficState } = require('./usageServiceHelpers.js');

const FLUSH_DELAY_MS = 20000;
const pendingByAlias = new Map();
let flushTimer = null;
let flushing = false;

/** Records one served public download for the next aggregated flush. */
function notePublicDownload(aliasId, egressBytes, $i = {}) {
	if (!aliasId) return;
	const slot = pendingByAlias.get(aliasId) || { egressBytes: 0, requests: 0, $i };
	slot.requests += 1;
	slot.egressBytes += Math.max(0, Number(egressBytes) || 0);
	slot.$i = $i;
	pendingByAlias.set(aliasId, slot);
	scheduleFlush();
}

function scheduleFlush() {
	if (flushTimer || flushing) return;
	flushTimer = setTimeout(() => {
		flushTimer = null;
		void flushPublicDownloads();
	}, FLUSH_DELAY_MS);
	if (typeof flushTimer.unref === 'function') flushTimer.unref();
}

/** Applies every pending counter batch as one state mutation per alias. */
async function flushPublicDownloads() {
	if (flushing) {
		scheduleFlush();
		return;
	}
	const batch = [...pendingByAlias.entries()];
	pendingByAlias.clear();
	if (!batch.length) return;
	flushing = true;
	try {
		for (const [aliasId, slot] of batch) {
			try {
				await mutateDriveState(aliasId, slot.$i, state => {
					pruneTrafficState(state);
					const month = currentMonthUsage(state);
					month.requests += slot.requests;
					month.egressBytes += slot.egressBytes;
					state.usage.requests += slot.requests;
					state.usage.egressBytes += slot.egressBytes;
				});
			} catch {
				// Accounting must never break serving; a failed flush drops
				// only its own counters, never a response already sent.
			}
		}
	} finally {
		flushing = false;
		if (pendingByAlias.size) scheduleFlush();
	}
}

module.exports = {
	flushPublicDownloads,
	notePublicDownload
};
