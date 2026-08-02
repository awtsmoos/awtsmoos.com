// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeChunkBuild.cjs
 * @description Compiles, compares, writes, compresses, and manifests one generated runtime chunk.
 * The Awtsmoos gathers a complete later garment into one deterministic vessel;
 * Awtsmoos.com keeps entry, modules, identity, Brotli, gzip, bytes, and hashes explicit.
 */

const fs = require('node:fs');
const path = require('node:path');
const {
	compressGeneratedAsset
} = require('../GeneratedAssetCompression.cjs');
const {
	compactResult
} = require('./CompactJsAdapter.cjs');
const {
	normalizeText
} = require('./CompactJsBuildWriter.cjs');
const {
	sha256
} = require('./CompactJsManifest.cjs');

async function buildRuntimeChunk(options) {
	const first = normalizeResult(await options.compileOnce(options.entryFile));
	const second = normalizeResult(await options.compileOnce(options.entryFile));
	const firstHash = sha256(first.code);
	const secondHash = sha256(second.code);
	if (firstHash !== secondHash) {
		throw new Error(`RUNTIME_CHUNK_NONDETERMINISTIC:${options.name}`);
	}
	fs.writeFileSync(options.outputFile, first.code);
	const representations = compressGeneratedAsset(options.outputFile);
	const manifest = Object.freeze({
		deterministic: true,
		entry: path.relative(options.gameRoot, options.entryFile),
		moduleCount: first.modules.length || 1,
		modules: Object.freeze(first.modules),
		name: options.name,
		outputBytes: Buffer.byteLength(first.code),
		outputHash: firstHash,
		representations
	});
	fs.writeFileSync(
		options.manifestFile,
		`${JSON.stringify(manifest, null, '\t')}\n`
	);
	return manifest;
}

function normalizeResult(value) {
	const result = compactResult(value);
	return {
		code: normalizeText(result.code),
		modules: result.modules
	};
}

module.exports = {
	buildRuntimeChunk
};
