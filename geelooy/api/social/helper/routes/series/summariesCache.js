//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module SummariesCache
 * @description
 * Cache vessel for sub-series summaries (safeguards program,
 * Phase 2, 2026-10-20). Extracted from subSeriesSummaries.js so
 * the cache discipline lives in one small, auditable module:
 *
 *  - FRESH entries (inside the TTL) are served with no work.
 *  - STALE entries are NEVER deleted on write paths; they stay
 *    available for stale-while-revalidate when the box is
 *    shedding or a recompute is already in flight.
 *  - Concurrent cold callers SHARE one recompute (in-flight
 *    registry) instead of stampeding the same expensive read.
 *
 * Entries expire by TTL check only — no writer ever reaches in
 * and clears this map (the grouped-cache lesson, applied).
 */

/** @constant {number} Freshness window for one summaries entry. */
const SUMMARIES_TTL_MS = 30000;

/** @type {Map<string, {at:number, data:*}>} key -> entry */
const entries = new Map();
/** @type {Map<string, Promise<*>>} key -> in-flight recompute */
const inflight = new Map();

/**
 * Builds the cache key for one children listing.
 * @param {string} heichelId Heichel id.
 * @param {string} parentSeriesId Parent series id.
 * @returns {string} Cache key.
 */
function summariesCacheKey(heichelId, parentSeriesId) {
	return heichelId + '|' + parentSeriesId;
}

/**
 * Fresh data for a key, or null when missing/stale.
 * @param {string} key Cache key.
 * @returns {*} Cached data or null.
 */
function freshData(key) {
	const entry = entries.get(key);
	if (entry && (Date.now() - entry.at) < SUMMARIES_TTL_MS) return entry.data;
	return null;
}

/**
 * Last-known data for a key however old, or null when absent.
 * This is the stale-while-revalidate supply: better a slightly
 * old listing than a 503 or a stampede while the box recovers.
 * @param {string} key Cache key.
 * @returns {*} Cached data or null.
 */
function staleData(key) {
	const entry = entries.get(key);
	return entry ? entry.data : null;
}

/**
 * Stores freshly computed data for a key.
 * @param {string} key Cache key.
 * @param {*} data Computed summaries.
 * @returns {*} The stored data.
 */
function storeData(key, data) {
	entries.set(key, { at: Date.now(), data });
	return data;
}

/**
 * Runs one producer per key at a time: concurrent callers await
 * the SAME promise; the result is stored before it resolves.
 * @param {string} key Cache key.
 * @param {Function} producer Async () => data for this key.
 * @returns {Promise<*>} The shared result.
 */
async function runShared(key, producer) {
	const running = inflight.get(key);
	if (running) return running;
	const promise = (async () => {
		try {
			return storeData(key, await producer());
		} finally {
			inflight.delete(key);
		}
	})();
	inflight.set(key, promise);
	return promise;
}

module.exports = {
	SUMMARIES_TTL_MS,
	summariesCacheKey,
	freshData,
	staleData,
	storeData,
	runShared,
};
