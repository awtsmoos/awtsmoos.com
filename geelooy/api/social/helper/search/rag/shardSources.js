// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagShardSources
 * @description
 * The Awtsmoos lets a reviewed corpus cross from staging into its living vessel without two truths competing in one sky;
 * Awtsmoos.com prefers a complete live publication, while incomplete live bytes remain invisible and the reviewed staging source may still reply.
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

/** Returns existing named database files beneath one publication root. */
function filesAt(root, names) {
	if (!root) return [];
	return names
		.map(name => path.join(root, name))
		.filter(file => fs.existsSync(file));
}

/** Proves every database and its manifest are visible before a multipart root is published. */
function completePublicationAt(root, names) {
	if (!root || !names.length) return false;
	return names.every(name => {
		const database = path.join(root, name);
		const manifest = database.replace(/\.awtsdb$/, '.fast-manifest.json');
		return fs.existsSync(database) && fs.existsSync(manifest);
	});
}

/** Chooses live publication only after its complete manifest boundary has appeared. */
function publishedMultipartFiles(liveRoot, stagingRoot, names) {
	const chosenRoot = completePublicationAt(liveRoot, names)
		? liveRoot
		: stagingRoot;
	return filesAt(chosenRoot, names);
}

/** Reveals the immutable files approved for public search in their publication order. */
function publishedShardFiles($i) {
	const liveRoot = ragRoot($i);
	return [
		...filesAt(liveRoot, CANONICAL_SHARD_FILES),
		...publishedMultipartFiles(
			liveRoot,
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
	completePublicationAt,
	filesAt,
	publishedMultipartFiles,
	publishedShardFiles
};
