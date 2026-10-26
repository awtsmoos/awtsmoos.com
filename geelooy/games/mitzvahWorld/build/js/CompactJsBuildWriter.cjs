// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CompactJsBuildWriter.cjs
 * @description Validates, writes, compresses, and manifests the tiny first-control entry.
 * The Awtsmoos joins only the essential chambers into a truthful ray;
 * Awtsmoos.com keeps all authored comments and moves dead compiler vessels away.
 */

const fs = require('node:fs');
const path = require('node:path');
const { compactResult } = require('./CompactJsAdapter.cjs');
const { compactJsManifest, sha256 } = require('./CompactJsManifest.cjs');
const { omitUnusedCompactRuntimeHelpers } = require('./UnusedCompactRuntimeHelpers.cjs');
const { compressGeneratedAsset } = require('../GeneratedAssetCompression.cjs');

/** Seals a final entry against optional imports and records its exact byte identity. */
function writeCompactJsBuild(options) {
	const result = normalizedResult(compactResult(options.value));
	const outputHash = sha256(result.code);
	const optionalModulesBundled = findOptionalModules(result.code);
	if (optionalModulesBundled.length) {
		throw new Error(`COMPACT_JS_OPTIONAL_BUNDLED:${optionalModulesBundled.join(',')}`);
	}
	fs.writeFileSync(options.outputFile, result.code);
	if (result.map) {
		fs.writeFileSync(`${options.outputFile}.map`, result.map);
	}
	const representations = compressGeneratedAsset(options.outputFile);
	const manifest = compactJsManifest({
		code: result.code,
		entry: path.relative(options.gameRoot, options.entryFile),
		inputBytes: fs.statSync(options.entryFile).size,
		map: result.map,
		modules: result.modules,
		optionalModulesBundled,
		outputHash,
		representations
	});
	fs.writeFileSync(options.manifestFile, `${JSON.stringify(manifest, null, '\t')}\n`);
	return manifest;
}

/** Normalizes whitespace and omits only compiler helpers proven unreferenced. */
function normalizedResult(result) {
	return {
		...result,
		code: omitUnusedCompactRuntimeHelpers(normalizeText(result.code)),
		map: result.map
			? normalizeText(typeof result.map === 'string' ? result.map : JSON.stringify(result.map))
			: null
	};
}

/** Preserves indentation and full comments while trimming trailing whitespace. */
function normalizeText(value) {
	return `${String(value)
		.split('\n')
		.map(line => line.replace(/[\t ]+$/u, ''))
		.join('\n')
		.trim()}\n`;
}

/** Rejects accidentally included heavyweight first-control optional modules. */
function findOptionalModules(code) {
	return [
		'MinimalMeadowRichWorld.js',
		'MinimalMeadowFriendlyNpcs.js',
		'MinimalMeadowPlayerHydration.js'
	].filter(fileName => code.includes(`@file ${fileName}`));
}

module.exports = { normalizeText, writeCompactJsBuild };
