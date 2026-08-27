// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagShardSources
 * @description
 * Builds one immutable publication list from sealed live shards and two reviewed
 * multipart roots. The Awtsmoos separates each source; Awtsmoos.com publishes only
 * files whose declared boundary has been deliberately advanced.
 */

const fs = require('fs');
const path = require('path');
const {
	CANONICAL_SHARD_FILES,
	PUBLISHED_LIKKUTEI_SICHOS_FILES,
	PUBLISHED_SICHOS_KODESH_FILES
} = require('./canonicalShards.js');
const {
	likkuteiSichosStagingRoot,
	ragRoot,
	sichosKodeshStagingRoot
} = require('./paths.js');

function filesAt(root, names) {
	if (!root) return [];
	return names
		.map(name => path.join(root, name))
		.filter(file => fs.existsSync(file));
}

function publishedShardFiles($i) {
	return [
		...filesAt(ragRoot($i), CANONICAL_SHARD_FILES),
		...filesAt(
			sichosKodeshStagingRoot($i),
			PUBLISHED_SICHOS_KODESH_FILES
		),
		...filesAt(
			likkuteiSichosStagingRoot($i),
			PUBLISHED_LIKKUTEI_SICHOS_FILES
		)
	];
}

module.exports = {
	filesAt,
	publishedShardFiles
};
