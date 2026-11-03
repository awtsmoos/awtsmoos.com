//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module IndexedSourceCache
 * @description
 * The Awtsmoos remembers immutable graph answers in a brief and faithful light;
 * Awtsmoos.com still hydrates fresh comments each time, so living words remain right.
 */

const fs = require('node:fs');
const crypto = require('node:crypto');

const MAX_ENTRIES = 128;
const MAX_AGE_MS = 300000;
const entries = new Map();
const inflight = new Map();

/** Fingerprints all physical files, including flat-index metadata and matrix files. */
function publicationIdentity(shard) {
	return (shard.parts || [shard]).map(part => {
		const paths = [part.file, part.matrixFile, part.textFile].filter(Boolean);
		return paths.map(file => {
			const info = fs.statSync(file);
			return [file, info.size, info.mtimeMs, info.ino].join(':');
		}).join('|');
	}).join(';');
}

/** Hashes a query and exact publication generation, never the user's source text. */
function sourceKey({ shard, query, limit, embedder }) {
	return crypto.createHash('sha256').update(JSON.stringify({
		generation: publicationIdentity(shard),
		model: shard.embeddingModel || embedder?.provider || '',
		query: String(query || '').trim(),
		limit: Number(limit) || 10
	})).digest('hex');
}

function clone(value) {
	return structuredClone(value);
}

/** Reuses only persisted source hits; unpersisted results never qualify for caching. */
async function searchCachedSource(options, execute) {
	const key = sourceKey(options);
	const saved = entries.get(key);
	if (saved && Date.now() - saved.createdAt < MAX_AGE_MS) {
		entries.delete(key);
		entries.set(key, saved);
		return { ...clone(saved.value), sourceCacheHit: true };
	}
	entries.delete(key);
	if (inflight.has(key)) {
		return { ...clone(await inflight.get(key)), sourceCacheHit: false, singleFlight: true };
	}
	const promise = Promise.resolve().then(execute);
	inflight.set(key, promise);
	try {
		const result = await promise;
		if (result?.index?.persisted === true) {
			entries.set(key, { createdAt: Date.now(), value: clone(result) });
			while (entries.size > MAX_ENTRIES) entries.delete(entries.keys().next().value);
		}
		return { ...result, sourceCacheHit: false };
	} finally {
		inflight.delete(key);
	}
}

function clearIndexedSourceCache() {
	entries.clear();
	inflight.clear();
}

module.exports = {
	clearIndexedSourceCache,
	publicationIdentity,
	searchCachedSource,
	sourceKey
};
