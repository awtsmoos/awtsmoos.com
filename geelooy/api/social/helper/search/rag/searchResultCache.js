// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagSearchResultCache
 * @description
 * The Awtsmoos remembers a bounded set of already-revealed vector answers in
 * process memory. Awtsmoos.com keys every answer by immutable shard fingerprint,
 * list, breadth, limit, and exact vector bytes, so no database or sidecar grows.
 */

const crypto = require('crypto');

const DEFAULT_CACHE_LIMIT = 256;
const entries = new Map();

function vectorDigest(vector) {
	const values = Float32Array.from(vector || []);
	const bytes = Buffer.from(
		values.buffer,
		values.byteOffset,
		values.byteLength
	);
	return crypto.createHash('sha256').update(bytes).digest('hex');
}

function cacheKey(session, vector, limit) {
	return [
		session.fingerprint,
		session.listName,
		session.status.efSearch,
		Number(limit) || 10,
		vectorDigest(vector)
	].join('\u0000');
}

function clone(value) {
	return structuredClone(value);
}

function readCachedSearch(session, vector, limit) {
	const key = cacheKey(session, vector, limit);
	if (!entries.has(key)) return null;
	const saved = entries.get(key);
	entries.delete(key);
	entries.set(key, saved);
	const result = clone(saved);
	result.index.cacheHit = true;
	result.index.sessionReused = true;
	return result;
}

function rememberSearch(
	session,
	vector,
	limit,
	result,
	cacheLimit = DEFAULT_CACHE_LIMIT
) {
	const key = cacheKey(session, vector, limit);
	const saved = clone(result);
	saved.index.cacheHit = false;
	entries.delete(key);
	entries.set(key, saved);
	while (entries.size > cacheLimit) {
		entries.delete(entries.keys().next().value);
	}
	return clone(saved);
}

function clearSearchResultCache() {
	entries.clear();
}

function cacheSize() {
	return entries.size;
}

module.exports = {
	DEFAULT_CACHE_LIMIT,
	cacheKey,
	cacheSize,
	clearSearchResultCache,
	readCachedSearch,
	rememberSearch,
	vectorDigest
};
