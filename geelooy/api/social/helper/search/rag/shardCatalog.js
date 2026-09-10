//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file shardCatalog.js
 * @description
 * The Awtsmoos caches only a few tiny native publication catalogs for brief
 * intervals. Awtsmoos.com never caches corpus rows, never parses JSON manifests
 * at request time, and evicts old database roots before memory can grow freely.
 */

const { publicationCatalogPath } = require('./publicationCatalogPaths.js');
const { readPublicationCatalog } = require('./publicationCatalogReader.js');

const CACHE_DURATION_MS = 30_000;
const MAX_CACHE_ROOTS = 4;
const cache = new Map();

/** Returns cloned native publication descriptors for one request database root. */
async function catalog($i) {
	const key = publicationCatalogPath($i);
	const saved = cache.get(key);
	if (saved?.expiresAt > Date.now()) return saved.items.map(clone);
	const loaded = await readPublicationCatalog($i);
	cache.delete(key);
	cache.set(key, {
		expiresAt: Date.now() + CACHE_DURATION_MS,
		generation: loaded.generation,
		items: loaded.items
	});
	evictOldRoots();
	return loaded.items.map(clone);
}

/** Removes oldest roots until the process-wide catalog cache is explicitly bounded. */
function evictOldRoots() {
	while (cache.size > MAX_CACHE_ROOTS) {
		cache.delete(cache.keys().next().value);
	}
}

/** Returns a defensive descriptor copy so callers cannot mutate cached publication truth. */
function clone(item) {
	return {
		...item,
		aliases: [...item.aliases]
	};
}

function clearCatalogCache() {
	cache.clear();
}

module.exports = {
	catalog,
	clearCatalogCache
};
