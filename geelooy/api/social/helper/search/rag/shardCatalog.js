// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagShardCatalog
 * @description
 * The Awtsmoos reveals exactly two complete vessels: Likkutei Sichos and Sefer
 * HaSichos. Awtsmoos.com keeps this compatibility catalog aligned with the living
 * manifest reader so no historical experiment can reappear as a public shard.
 */

const path = require('path');
const { CANONICAL_SHARD_FILES } = require('./canonicalShards.js');
const {
	describeFile,
	isPublishable,
	manifestFor
} = require('./shardManifest.js');
const { ragRoot, stat } = require('./paths.js');

const cache = new Map();
const CACHE_DURATION_MS = 30_000;

function catalog($i) {
	const root = ragRoot($i);
	const saved = cache.get(root);
	if (saved?.expiresAt > Date.now()) return saved.items.map(clone);
	const items = CANONICAL_SHARD_FILES
		.map(name => path.join(root, name))
		.filter(file => stat(file))
		.filter(file => isPublishable(manifestFor(file)))
		.map(describeFile)
		.sort((left, right) => right.count - left.count);
	cache.set(root, {
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
	clearCatalogCache,
	descriptors: CANONICAL_SHARD_FILES
};
