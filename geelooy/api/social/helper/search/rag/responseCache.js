// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagResponseCache
 * @description
 * The Awtsmoos remembers bounded public JSON. Static metadata comments are keyed
 * explicitly, while mutable database-comment responses remain uncached.
 */

const crypto = require('crypto');
const { storageFingerprint } = require('./storageInvariant.js');

const DEFAULT_ENTRY_LIMIT = 128;
const DEFAULT_TTL_MS = 300000;
const entries = new Map();

function eligible(options = {}) {
	return options.includeComments !== true;
}

function cacheKey(options, shard, storage) {
	const payload = {
		includeMetadataComments: options.includeMetadataComments !== false,
		limit: Number(options.limit || 10),
		query: String(options.query || '').trim(),
		requireIndexed: options.requireIndexed === true,
		shard: {
			aliases: shard.aliases || [],
			bytes: Number(shard.bytes || 0),
			count: Number(shard.count || 0),
			dimensions: Number(shard.dimensions || 0),
			id: shard.id,
			listName: shard.listName,
			title: shard.title
		},
		storage: storageFingerprint(storage),
		strategy: String(options.strategy || 'auto').toLowerCase()
	};
	return crypto.createHash('sha256')
		.update(JSON.stringify(payload))
		.digest('hex');
}

function readCachedResponse(options, shard, storage, settings = {}) {
	if (!eligible(options)) return null;
	const now = Number(settings.now ?? Date.now());
	const ttlMs = bounded(settings.ttlMs, DEFAULT_TTL_MS, 1000, 3600000);
	const key = cacheKey(options, shard, storage);
	const entry = entries.get(key);
	if (!entry) return null;
	if (now - entry.createdAt > ttlMs) {
		entries.delete(key);
		return null;
	}
	entries.delete(key);
	entries.set(key, entry);
	return {
		ageMs: Math.max(0, now - entry.createdAt),
		value: jsonClone(entry.value)
	};
}

function rememberResponse(options, shard, storage, value, settings = {}) {
	if (!eligible(options)) return false;
	const now = Number(settings.now ?? Date.now());
	const limit = bounded(settings.entryLimit, DEFAULT_ENTRY_LIMIT, 1, 512);
	const key = cacheKey(options, shard, storage);
	entries.delete(key);
	entries.set(key, {
		createdAt: now,
		value: jsonClone(value)
	});
	while (entries.size > limit) {
		entries.delete(entries.keys().next().value);
	}
	return true;
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value ?? fallback);
	return Number.isFinite(number)
		? Math.min(maximum, Math.max(minimum, number))
		: fallback;
}

function jsonClone(value) {
	return JSON.parse(JSON.stringify(value));
}

function clearResponseCache() {
	entries.clear();
}

function responseCacheSize() {
	return entries.size;
}

module.exports = {
	DEFAULT_ENTRY_LIMIT,
	DEFAULT_TTL_MS,
	cacheKey,
	clearResponseCache,
	eligible,
	jsonClone,
	readCachedResponse,
	rememberResponse,
	responseCacheSize
};
