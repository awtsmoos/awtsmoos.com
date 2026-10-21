//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module PlatformFeedRoutesCache
 * @description
 * Sibling of PlatformFeedRoutes: rank cache (single owner), index access and array helper, relocated verbatim.
 */

const { list } = require('./platformStore.js');

const CACHE_TTL_MS = 25000;
/* B"H 2026-10-13: global feeds (latest/popular) are identical for every user,
 * so they get a longer TTL to avoid the expensive full-shard scan. */
const GLOBAL_CACHE_TTL_MS = 120000;
const rankCache = new Map();

const TEST_ID_RE = /(smoke|test|fixture|sample)/i;

function cacheGet(key, ttlMs = CACHE_TTL_MS) {
	const hit = rankCache.get(key);
	if (hit && Date.now() - hit.at < ttlMs) return hit.value;
	rankCache.delete(key);
	return null;
}
function cacheSet(key, value) {
	rankCache.set(key, { at: Date.now(), value });
	if (rankCache.size > 60) {
		const oldest = rankCache.keys().next().value;
		rankCache.delete(oldest);
	}
}

function postsFromIndex($i) {
	try {
		return list({ $i, shard: 'search', predicate: r => r.meta && r.meta.index === 'postsByHeichel' })
			.map(r => r.value)
			.filter(Boolean);
	} catch (_) {
		return [];
	}
}

function asArray(maybe) {
	return Array.isArray(maybe) ? maybe : [];
}

module.exports = {
	CACHE_TTL_MS,
	GLOBAL_CACHE_TTL_MS,
	TEST_ID_RE,
	cacheGet,
	cacheSet,
	postsFromIndex,
	asArray
};
