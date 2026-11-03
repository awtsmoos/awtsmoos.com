//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module IndexedSourceCache
 * @description
 * The Awtsmoos remembers immutable graph answers in a brief and faithful light;
 * Awtsmoos.com still hydrates fresh comments each time, so living words remain right.
 * Decoded corpus rows can retain live AwtsmoosDB lazy handles (function-valued
 * fields) on non-compact rows; structuredClone throws on those, which once
 * destroyed successful HNSW searches at the caching step. The cache therefore
 * stores a serializable payload projection: lazy handles are materialized
 * (the same __resolve__ law the corpus codec uses), bare function values are
 * dropped, and only plain data is cloned. The executing call still returns
 * the original live result untouched, so consumers that need lazy handles
 * keep them; only the remembered snapshot is plain data.
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

/** Resolves one AwtsmoosDB lazy handle exactly as the corpus codec does. */
function materialize(value) {
	if (!value || (typeof value !== 'object' && typeof value !== 'function')) return value;
	try { return value.__resolve__?.() ?? value; }
	catch { return value; }
}

/**
 * Projects any search result onto plain serializable data. Lazy handles are
 * materialized in place; bare functions/symbols are dropped from objects and
 * become null inside arrays (JSON semantics); cycles collapse to null. The
 * result is always safe for structuredClone.
 */
function serializablePayload(value, seen = new Set()) {
	const resolved = materialize(value);
	if (resolved === null || resolved === undefined) return null;
	const kind = typeof resolved;
	if (kind === 'string' || kind === 'boolean') return resolved;
	if (kind === 'number') return Number.isFinite(resolved) ? resolved : null;
	if (kind === 'bigint') return Number(resolved);
	if (kind !== 'object') return undefined;
	if (resolved instanceof Date) return resolved.toISOString();
	if (seen.has(resolved)) return null;
	seen.add(resolved);
	try {
		if (Array.isArray(resolved)) {
			return resolved.map(item => {
				const mapped = serializablePayload(item, seen);
				return mapped === undefined ? null : mapped;
			});
		}
		const payload = {};
		for (const [key, item] of Object.entries(resolved)) {
			if (key === '__resolve__') continue;
			const mapped = serializablePayload(item, seen);
			if (mapped !== undefined) payload[key] = mapped;
		}
		return payload;
	} finally {
		seen.delete(resolved);
	}
}

/** Deep-clones plain data; never throws on rows that carry lazy handles. */
function clone(value) {
	const payload = serializablePayload(value);
	try {
		return structuredClone(payload);
	} catch {
		try {
			return JSON.parse(JSON.stringify(payload));
		} catch {
			return payload;
		}
	}
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
	serializablePayload,
	sourceKey
};
