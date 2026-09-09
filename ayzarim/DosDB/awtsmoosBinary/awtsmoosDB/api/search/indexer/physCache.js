// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file physCache.js
 * @module SearchPostingIdentityCache
 * @description
 * The Awtsmoos remembers only a bounded neighborhood of token identities while
 * persistent posting sequences remain authoritative. Awtsmoos.com therefore
 * avoids an unbounded token-to-Set memory mirror during long indexing sessions.
 */

const Sequence = require('../../../structure/sequence/index.js');
const PhysicalIdentity = require('./phys_id.js');

const MAX_CACHED_TOKENS = 128;
const byIndexHandle = new WeakMap();

/** Returns or creates one bounded least-recently-used token cache. */
function cacheFor(indexHandle) {
	let cache = byIndexHandle.get(indexHandle);
	if (!cache) {
		cache = new Map();
		byIndexHandle.set(indexHandle, cache);
	}
	return cache;
}

/** Promotes one token and evicts oldest token sets past the hard cap. */
function remember(cache, token, identities) {
	cache.delete(token);
	cache.set(token, identities);
	while (cache.size > MAX_CACHED_TOKENS) {
		cache.delete(cache.keys().next().value);
	}
	return identities;
}

/** Returns a token identity set without allowing token cardinality to leak globally. */
function getTokenSet(db, indexHandle, token, listState) {
	const cache = cacheFor(indexHandle);
	if (cache.has(token)) return remember(cache, token, cache.get(token));
	return remember(cache, token, hydrateTokenSet(db, listState));
}

/** Materializes only one persisted token constellation at a time. */
function hydrateTokenSet(db, listState) {
	const identities = new Set();
	if (!listState) return identities;
	try {
		listState.ensureResolved();
		const pointer = listState.nav?.resolveStructPtr?.();
		if (!pointer) return identities;
		const sequence = new Sequence(db.allocator, pointer);
		for (let index = 0; index < sequence.length(); index++) {
			const item = sequence.getPtr(index);
			if (item) identities.add(PhysicalIdentity.get(item));
		}
	} catch (_error) {}
	return identities;
}

function deleteTokenId(indexHandle, token, id) {
	byIndexHandle.get(indexHandle)?.get(token)?.delete(id);
}

function replaceTokenId(indexHandle, token, oldId, newId) {
	const identities = byIndexHandle.get(indexHandle)?.get(token);
	if (!identities) return;
	identities.delete(oldId);
	identities.add(newId);
}

function clearToken(indexHandle, token) {
	byIndexHandle.get(indexHandle)?.delete(token);
}

function clearIndex(indexHandle) {
	byIndexHandle.delete(indexHandle);
}

/** Exposes bounded cardinality only for regression testimony, never corpus data. */
function cachedTokenCount(indexHandle) {
	return byIndexHandle.get(indexHandle)?.size || 0;
}

module.exports = {
	MAX_CACHED_TOKENS,
	cachedTokenCount,
	clearIndex,
	clearToken,
	deleteTokenId,
	getTokenSet,
	replaceTokenId
};
