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
	if (!root) {
		return [];
	}
	return names
		.map(name => path.join(root, name))
		.filter(file => fs.existsSync(file));
}

/** Proves every database and matching manifest are visible before multipart publication becomes discoverable. */
function completePublicationAt(root, names) {
	if (!root || !names.length) {
		return false;
	}
	return names.every(name => {
		const database = path.join(root, name);
		const manifest = database.replace(/\.awtsdb$/, '.fast-manifest.json');
		return fs.existsSync(database) && fs.existsSync(manifest);
	});
}

/** Selects live publication only after its complete manifest boundary appears. */
function publishedMultipartFiles(liveRoot, stagingRoot, names) {
	let chosenRoot = stagingRoot;
	if (completePublicationAt(liveRoot, names)) {
		chosenRoot = liveRoot;
	}
	return filesAt(chosenRoot, names);
}

/** Reveals every immutable file approved for public search in publication order. */
function publishedShardFiles($i) {
	const liveRoot = ragRoot($i);
	const sichosFiles = publishedMultipartFiles(
		liveRoot,
		sichosKodeshStagingRoot($i),
		PUBLISHED_SICHOS_KODESH_FILES
	);
	const likkuteiFiles = filesAt(
		likkuteiSichosStagingRoot($i),
		PUBLISHED_LIKKUTEI_SICHOS_FILES
	);
	return [
		...filesAt(liveRoot, CANONICAL_SHARD_FILES),
		...sichosFiles,
		...likkuteiFiles
	];
}

module.exports = {
	completePublicationAt,
	filesAt,
	publishedMultipartFiles,
	publishedShardFiles
};
