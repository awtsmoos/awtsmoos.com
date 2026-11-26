// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SeriesReadCache
 * @description
 * Bounded in-memory LRU cache for hot series read paths. The series post-ID
 * list changes rarely (only on publish/delete) but is re-enumerated on every
 * /posts/details request. Caching the identity list avoids a full key scan
 * per request; post bodies are still read through the narrow child paths so
 * freshness is preserved per record.
 *
 * Run 5 (2026-11-26): the identity TTL rises from 60s to 300s — writers
 * already invalidate on every publish/delete, so the short TTL only bought
 * repeated cold enumerations.
 *
 * Boot-warm round (2026-11-26): the details TTL rises from 60s to 300s on
 * the same reasoning — invalidation, not the TTL, guards freshness — and
 * SeriesBootWarm primes the large-series memo once per process so the
 * first real request after a start is not the cold one. A bounded details memo joins it: the fully
 * projected details page for one series is stored as its JSON string
 * (300s TTL, at most 4 series pages, at most ~8MB each) so repeat reads
 * inside the window skip thousands of per-record database reads — the
 * measured cold fill was 13.55s vs 0.044s warm for a 2,073-post series.
 * Hits return a fresh parse, so callers can never mutate the memo.
 *
 * Invalidation: bulkPublishPosts and the single-post writers call
 * invalidateSeries(heichelId, seriesId) after a successful write; it now
 * drops the identity list AND every details page for that series.
 */

const MAX_ENTRIES = 500;
const DEFAULT_TTL_MS = 60 * 1000;
const IDS_TTL_MS = 300 * 1000;
const DETAILS_TTL_MS = 300 * 1000;
const MAX_DETAILS_ENTRIES = 4;
const MAX_DETAILS_BYTES = 8 * 1024 * 1024;

const cache = new Map(); // key -> { value, expiresAt, lastUsed }

function cacheKey(heichelId, seriesId, kind) {
	return `${heichelId}::${seriesId}::${kind}`;
}

function evictOldest() {
	let oldestKey = null;
	let oldestUsed = Infinity;
	for (const [k, v] of cache) {
		if (v.lastUsed < oldestUsed) {
			oldestUsed = v.lastUsed;
			oldestKey = k;
		}
	}
	if (oldestKey) cache.delete(oldestKey);
}

function getCachedSeriesIds(heichelId, seriesId) {
	const key = cacheKey(heichelId, seriesId, "ids");
	const entry = cache.get(key);
	if (!entry) return null;
	if (Date.now() > entry.expiresAt) {
		cache.delete(key);
		return null;
	}
	entry.lastUsed = Date.now();
	return entry.value;
}

function setCachedSeriesIds(heichelId, seriesId, ids, ttlMs = IDS_TTL_MS) {
	const key = cacheKey(heichelId, seriesId, "ids");
	if (cache.size >= MAX_ENTRIES) evictOldest();
	cache.set(key, {
		value: ids,
		expiresAt: Date.now() + ttlMs,
		lastUsed: Date.now()
	});
}

/** Returns a fresh parse of the memoized details page, or null on a miss. */
function getCachedSeriesDetails(heichelId, seriesId, pageKey) {
	const key = cacheKey(heichelId, seriesId, `details:${pageKey}`);
	const entry = cache.get(key);
	if (!entry) return null;
	if (Date.now() > entry.expiresAt) {
		cache.delete(key);
		return null;
	}
	entry.lastUsed = Date.now();
	try {
		return JSON.parse(entry.value);
	} catch {
		cache.delete(key);
		return null;
	}
}

/** Memoizes one details page as its JSON string; oversize pages are skipped. */
function setCachedSeriesDetails(heichelId, seriesId, pageKey, records, ttlMs = DETAILS_TTL_MS) {
	let serialized;
	try {
		serialized = JSON.stringify(records);
	} catch {
		return false;
	}
	if (!serialized || serialized.length > MAX_DETAILS_BYTES) return false;
	let detailsCount = 0;
	for (const k of cache.keys()) {
		if (k.includes("::details:")) detailsCount += 1;
	}
	if (detailsCount >= MAX_DETAILS_ENTRIES) evictOldest();
	cache.set(cacheKey(heichelId, seriesId, `details:${pageKey}`), {
		value: serialized,
		expiresAt: Date.now() + ttlMs,
		lastUsed: Date.now()
	});
	return true;
}

function invalidateSeries(heichelId, seriesId) {
	cache.delete(cacheKey(heichelId, seriesId, "ids"));
	const detailsPrefix = cacheKey(heichelId, seriesId, "details:");
	for (const k of [...cache.keys()]) {
		if (k.startsWith(detailsPrefix)) cache.delete(k);
	}
}

function invalidateAll() {
	cache.clear();
}

function cacheStats() {
	return { entries: cache.size, maxEntries: MAX_ENTRIES };
}

module.exports = {
	getCachedSeriesIds,
	setCachedSeriesIds,
	getCachedSeriesDetails,
	setCachedSeriesDetails,
	invalidateSeries,
	invalidateAll,
	cacheStats,
	DEFAULT_TTL_MS,
	IDS_TTL_MS,
	DETAILS_TTL_MS,
	MAX_DETAILS_BYTES
};
