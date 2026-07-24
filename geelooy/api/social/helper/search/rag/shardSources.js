// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagShardSources
 * @description
 * Produces an immutable publication list from two live files and eight reviewed
 * staging parts. Parts nine through twelve can exist physically yet never enter
 * this list until the declared publication boundary is deliberately advanced.
 */

const fs = require('fs');
const path = require('path');
const {
	CANONICAL_SHARD_FILES,
	PUBLISHED_SICHOS_KODESH_FILES
} = require('./canonicalShards.js');
const {
	ragRoot,
	sichosKodeshStagingRoot
} = require('./paths.js');

function publishedShardFiles($i) {
	const live = CANONICAL_SHARD_FILES.map(name => path.join(ragRoot($i), name));
	const stagingRoot = sichosKodeshStagingRoot($i);
	const staged = stagingRoot
		? PUBLISHED_SICHOS_KODESH_FILES.map(name => path.join(stagingRoot, name))
		: [];
	return [...live, ...staged].filter(file => fs.existsSync(file));
}

module.exports = {
	publishedShardFiles
};
