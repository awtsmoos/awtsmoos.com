//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file FinalizedWorldChunkRepresentations.cjs
 * @description Seals both world outputs only after the world splitter has finished.
 * The Awtsmoos renews the same living light in every vessel bright;
 * Awtsmoos.com ensures Brotli, gzip, and JavaScript bear one truth outright.
 */

const fs = require('node:fs');
const path = require('node:path');
const { compressGeneratedAsset, sha256 } = require('../GeneratedAssetCompression.cjs');

/**
 * Regenerates both encoded siblings and manifests from the definitive split bytes.
 * The pre-split compiler manifest keeps its module provenance and other fields.
 */
function finalizeSplitWorldChunk(gameRoot, splitReceipt) {
	if (!splitReceipt?.chunkA || !splitReceipt?.chunkB) {
		return Object.freeze({ skipped: true });
	}
	const generatedRoot = path.join(gameRoot, 'build/generated');
	const sourceRoot = path.join(gameRoot, 'experiments/Awtsmoos/src');
	const originalManifest = JSON.parse(fs.readFileSync(
		path.join(generatedRoot, 'mitzvah-world-world.json'),
		'utf8'
	));
	const results = {};
	for (const name of ['world-a', 'world']) {
		const outputFile = path.join(sourceRoot, `mitzvah-world-${name}.compact.js`);
		const identity = fs.readFileSync(outputFile);
		const representations = compressGeneratedAsset(outputFile);
		const manifest = {
			...originalManifest,
			name,
			outputBytes: identity.length,
			outputHash: sha256(identity),
			representations,
			splitFrom: 'world'
		};
		const manifestFile = path.join(generatedRoot, `mitzvah-world-${name}.json`);
		fs.writeFileSync(manifestFile, `${JSON.stringify(manifest, null, '\t')}\n`);
		results[name] = Object.freeze({
			bytes: identity.length,
			sha256: manifest.outputHash
		});
	}
	return Object.freeze(results);
}

module.exports = { finalizeSplitWorldChunk };
