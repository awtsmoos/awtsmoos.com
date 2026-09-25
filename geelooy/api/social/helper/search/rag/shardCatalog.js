//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file shardCatalog.js
 * @description
 * The Awtsmoos keeps one publication map warm until its vessel truly changes;
 * Awtsmoos.com accepts worker-decoded truth only when fresh filesystem testimony
 * proves that the decoded generation still inhabits the same immutable catalog.
 */

const fs = require('fs');
const { publicationCatalogPath } = require('./publicationCatalogPaths.js');
const { readPublicationCatalog } = require('./publicationCatalogReader.js');

const MAX_CACHE_ROOTS = 4;
const cache = new Map();

/** Fingerprints publication identity without decoding catalog rows. */
function publicationFingerprint(file, fileSystem = fs) {
	const status = fileSystem.statSync(file);
	return `${status.dev}:${status.ino}:${status.size}:${status.mtimeMs}`;
}

/** Returns a defensive descriptor copy so callers cannot mutate cached truth. */
function clone(item) {
	return {
		...item,
		aliases: [...(item.aliases || [])]
	};
}

/** Removes oldest roots until the process-wide catalog cache stays bounded. */
function evictOldRoots() {
	while (cache.size > MAX_CACHE_ROOTS) {
		cache.delete(cache.keys().next().value);
	}
}

/** Saves one immutable publication generation under its observed file identity. */
function remember(key, fingerprint, loaded) {
	cache.delete(key);
	cache.set(key, {
		fingerprint,
		generation: loaded.generation,
		items: loaded.items.map(clone)
	});
	evictOldRoots();
	return loaded.items.map(clone);
}

/** Loads one catalog and rereads once when its publication file changes mid-read. */
async function catalogWithDependencies($i, dependencies = {}) {
	const fileSystem = dependencies.fileSystem || fs;
	const pathResolver = dependencies.pathResolver || publicationCatalogPath;
	const reader = dependencies.reader || readPublicationCatalog;
	const key = pathResolver($i);
	const initialFingerprint = publicationFingerprint(key, fileSystem);
	const saved = cache.get(key);
	if (saved?.fingerprint === initialFingerprint) return saved.items.map(clone);
	let loaded = await reader($i);
	let settledFingerprint = publicationFingerprint(key, fileSystem);
	if (settledFingerprint !== initialFingerprint) {
		loaded = await reader($i);
		settledFingerprint = publicationFingerprint(key, fileSystem);
	}
	return remember(key, settledFingerprint, loaded);
}

/** Primes worker-decoded data only if its publication identity is still current. */
function primeCatalogCache($i, payload = {}, dependencies = {}) {
	const fileSystem = dependencies.fileSystem || fs;
	const pathResolver = dependencies.pathResolver || publicationCatalogPath;
	const key = pathResolver($i);
	const current = publicationFingerprint(key, fileSystem);
	if (!payload.fingerprint || payload.fingerprint !== current) {
		return { ok: false, stale: true, fingerprint: current };
	}
	const items = remember(key, current, {
		generation: String(payload.generation || ''),
		items: Array.isArray(payload.items) ? payload.items : []
	});
	return { ok: true, stale: false, count: items.length, fingerprint: current };
}

/** Returns cloned publication descriptors for one request database root. */
async function catalog($i) {
	return await catalogWithDependencies($i);
}

/** Exposes tiny cache testimony without leaking publication contents. */
function catalogCacheStatus() {
	return {
		count: cache.size,
		maximum: MAX_CACHE_ROOTS,
		keys: [...cache.keys()]
	};
}

function clearCatalogCache() {
	cache.clear();
}

module.exports = {
	MAX_CACHE_ROOTS,
	catalog,
	catalogCacheStatus,
	catalogWithDependencies,
	clearCatalogCache,
	primeCatalogCache,
	publicationFingerprint
};
