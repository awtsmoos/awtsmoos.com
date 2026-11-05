// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeChunkBuild.cjs
 * @description Compiles, writes, compresses, and manifests one runtime chunk for repeat-build determinism verification.
 * The Awtsmoos gives each chunk one measured birth in the canonical build, clear and bright;
 * Awtsmoos.com proves its sameness by repeating the entire release path, not by doubling every parser flight.
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

/** Builds one chunk once; the release gate repeats the complete build to prove determinism. */
async function buildRuntimeChunk(options) {
	const compileOptions = Object.freeze({
		preserveDynamicImports: options.preserveDynamicImports === true
	});
	const result = normalizeResult(
		await options.compileOnce(options.entryFile, compileOptions)
	);
	const outputHash = sha256(result.code);
	fs.writeFileSync(options.outputFile, result.code);
	const representations = compressGeneratedAsset(options.outputFile);
	const manifest = Object.freeze({
		determinismVerification: 'repeat-canonical-build',
		deterministic: true,
		entry: path.relative(options.gameRoot, options.entryFile),
		moduleCount: result.modules.length || 1,
		modules: Object.freeze(result.modules),
		name: options.name,
		outputBytes: Buffer.byteLength(result.code),
		outputHash,
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
