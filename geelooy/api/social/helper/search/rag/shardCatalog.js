// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagShardCatalog
 * @description
 * Caches manifest-only descriptions for every reviewed public file. No catalog
 * request opens AWTSDB, and unfinished Sichos Kodesh files never enter the source
 * list merely because they exist on disk.
 */

const { describeFile, shardFiles } = require('./shardManifest.js');

const cache = new Map();
const CACHE_DURATION_MS = 30_000;

function catalog($i) {
	const key = $i?.db?.directory || 'default';
	const saved = cache.get(key);
	if (saved?.expiresAt > Date.now()) return saved.items.map(clone);
	const items = shardFiles($i)
		.map(describeFile)
		.sort((left, right) => right.count - left.count);
	cache.set(key, {
		expiresAt: Date.now() + CACHE_DURATION_MS,
		items
	});
	return items.map(clone);
}

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
