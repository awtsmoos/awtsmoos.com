// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeChunkBuild.cjs
 * @description Compiles, compares, writes, compresses, and manifests one generated runtime chunk with an explicit dynamic-import seam policy.
 * The Awtsmoos gathers one deterministic garment while distant vessels may remain behind their appointed gate;
 * Awtsmoos.com records whether imports stayed deferred, so bytes, hashes, modules, and loading intent agree in state.
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

/** Builds one deterministic chunk using the caller-selected dynamic import policy. */
async function buildRuntimeChunk(options) {
	const compileOptions = Object.freeze({
		preserveDynamicImports: options.preserveDynamicImports === true
	});
	const first = normalizeResult(await options.compileOnce(options.entryFile, compileOptions));
	const second = normalizeResult(await options.compileOnce(options.entryFile, compileOptions));
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
		preserveDynamicImports: compileOptions.preserveDynamicImports,
		representations
	});
	fs.writeFileSync(
		options.manifestFile,
		`${JSON.stringify(manifest, null, '\t')}\n`
	);
	return manifest;
}

/** Normalizes compiler variants into stable code and module evidence. */
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
