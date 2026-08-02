// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CompactJsBuildWriter.cjs
 * @description Validates, writes, compresses, and manifests one deterministic CompactJS build.
 * The Awtsmoos joins readable chambers into identity, Brotli, and gzip without hiding their source;
 * Awtsmoos.com keeps repeated hashes, optional boundaries, maps, representations, and receipts explicit.
 */

const fs = require('node:fs');
const path = require('node:path');
const { compactResult } = require('./CompactJsAdapter.cjs');
const { compactJsManifest, sha256 } = require('./CompactJsManifest.cjs');
const {
	compressGeneratedAsset
} = require('../GeneratedAssetCompression.cjs');

function writeCompactJsBuild(options) {
	const first = normalizedResult(compactResult(options.firstValue));
	const second = normalizedResult(compactResult(options.secondValue));
	const firstHash = sha256(first.code);
	const secondHash = sha256(second.code);
	if (firstHash !== secondHash) {
		throw new Error('COMPACT_JS_NONDETERMINISTIC');
	}
	const optionalModulesBundled = findOptionalModules(first.code);
	if (optionalModulesBundled.length) {
		throw new Error(
			`COMPACT_JS_OPTIONAL_BUNDLED:${optionalModulesBundled.join(',')}`
		);
	}
	fs.writeFileSync(options.outputFile, first.code);
	if (first.map) fs.writeFileSync(`${options.outputFile}.map`, first.map);
	const representations = compressGeneratedAsset(options.outputFile);
	const manifest = compactJsManifest({
		code: first.code,
		entry: path.relative(options.gameRoot, options.entryFile),
		firstHash,
		inputBytes: fs.statSync(options.entryFile).size,
		map: first.map,
		modules: first.modules,
		optionalModulesBundled,
		representations,
		secondHash
	});
	fs.writeFileSync(
		options.manifestFile,
		`${JSON.stringify(manifest, null, '\t')}\n`
	);
	return manifest;
}

function normalizedResult(result) {
	return {
		...result,
		code: normalizeText(result.code),
		map: result.map
			? normalizeText(
				typeof result.map === 'string'
					? result.map
					: JSON.stringify(result.map)
			)
			: null
	};
}

function normalizeText(value) {
	return `${String(value)
		.split('\n')
		.map(line => line.replace(/[\t ]+$/u, ''))
		.join('\n')
		.trim()}\n`;
}

function findOptionalModules(code) {
	return [
		'MinimalMeadowRichWorld',
		'MinimalMeadowFriendlyNpcs',
		'MinimalMeadowPlayerHydration'
	].filter(marker => code.includes(marker));
}

module.exports = {
	normalizeText,
	writeCompactJsBuild
};
