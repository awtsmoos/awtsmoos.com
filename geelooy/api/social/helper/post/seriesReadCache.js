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
 * Invalidation: bulkPublishPosts and the single-post writers call
 * invalidateSeries(heichelId, seriesId) after a successful write.
 */

const MAX_ENTRIES = 500;
const DEFAULT_TTL_MS = 60 * 1000;

const cache = new Map(); // key -> { value, expiresAt, lastUsed }

function cacheKey(heichelId, seriesId, kind) {
	return `${heichelId}::${seriesId}::${kind}`;
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

function setCachedSeriesIds(heichelId, seriesId, ids, ttlMs = DEFAULT_TTL_MS) {
	const key = cacheKey(heichelId, seriesId, "ids");
	if (cache.size >= MAX_ENTRIES) {
		// Evict least-recently-used
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
	cache.set(key, {
		value: ids,
		expiresAt: Date.now() + ttlMs,
		lastUsed: Date.now()
	});
}

function invalidateSeries(heichelId, seriesId) {
	cache.delete(cacheKey(heichelId, seriesId, "ids"));
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
	invalidateSeries,
	invalidateAll,
	cacheStats,
	DEFAULT_TTL_MS
};
