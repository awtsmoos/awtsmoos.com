// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file aiSearch/vectorCorpus/reader.js
 * @chapter One Open Database Resolves Its Compact Seal Only Once
 * @description Caches the immutable compact-corpus manifest per open database and
 * decodes payloads without repeatedly traversing the same persisted dictionaries.
 */

const rowCodec = require('./rowCodec.js');
const MANIFEST_KEY = '__vector_corpus__';
const manifestCache = new WeakMap();

function manifestOf(database) {
	if (!database || typeof database !== 'object') return null;
	if (manifestCache.has(database)) return manifestCache.get(database);
	const value = database.root?.[MANIFEST_KEY];
	const manifest = materialize(value);
	manifestCache.set(database, manifest || null);
	return manifest || null;
}

function decodeWithManifest(manifest, row) {
	return manifest?.codec ? rowCodec.decode(manifest.codec, row) : row;
}

function decode(database, row) {
	return decodeWithManifest(manifestOf(database), row);
}

function decodeHits(database, hits) {
	const manifest = manifestOf(database);
	return Array.from(hits || []).map(hit => ({
		...hit,
		item: decodeWithManifest(manifest, hit.item)
	}));
}

function clearManifestCache(database) {
	if (database && typeof database === 'object') {
		manifestCache.delete(database);
	}
}

function materialize(value) {
	if (!value) return value;
	try { return value.__resolve__?.() ?? value; }
	catch { return value; }
}

module.exports = {
	MANIFEST_KEY,
	clearManifestCache,
	decode,
	decodeHits,
	decodeWithManifest,
	manifestOf
};
