// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file build-js.cjs
 * @description Builds first control, deferred chunks, then seals final split-world bytes.
 * The Awtsmoos gives the Chossid feet before ornaments arise in light;
 * Awtsmoos.com keeps the final shared world and compressed vessels right.
 */

const fs = require('node:fs');
const path = require('node:path');
const { buildEssentialReleaseAssets } = require('./EssentialReleaseAssetBuilder.cjs');
const { buildRuntimeChunkPreloadIdentity } = require('./RuntimeChunkPreloadIdentity.cjs');
const { compilerFunction } = require('./js/CompactJsAdapter.cjs');
const { writeCompactJsBuild } = require('./js/CompactJsBuildWriter.cjs');
const { buildRuntimeChunk } = require('./js/RuntimeChunkBuild.cjs');
const { finalizeSplitWorldChunk } = require('./js/FinalizedWorldChunkRepresentations.cjs');

const gameRoot = path.resolve(__dirname, '..');
const repositoryRoot = path.resolve(gameRoot, '../../..');
const publicRoot = path.join(repositoryRoot, 'geelooy');
const sourceRoot = path.join(gameRoot, 'experiments/Awtsmoos/src');
const generatedRoot = path.join(gameRoot, 'build/generated');
const compilerModule = require(path.join(
	repositoryRoot,
	'ayzarim/awtsmoosDynamicServer/compactJs/compiler.js'
));
const compile = compilerFunction(compilerModule);

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

/** Builds essential assets and modules before sealing the final split world. */
async function main() {
	console.error('[Mitzvah World build] essential assets');
	const skipAssets = process.argv.includes('--skip-assets');
	const essentialAssets = skipAssets
		? JSON.parse(fs.readFileSync(path.join(generatedRoot, 'mitzvah-world-essential-assets.json'), 'utf8'))
		: await buildEssentialReleaseAssets(gameRoot);
	if (skipAssets) {
		console.error('[Mitzvah World build] essential assets: reused verified local manifest (--skip-assets)');
	}
	const entryFile = path.join(sourceRoot, 'MinimalMeadowCompactBootstrap.js');
	console.error('[Mitzvah World build] main');
	const value = await compileMain(entryFile);
	const mainManifest = writeCompactJsBuild({
		entryFile,
		gameRoot,
		manifestFile: path.join(generatedRoot, 'mitzvah-world-js.json'),
		outputFile: path.join(sourceRoot, 'mitzvah-world.compact.js'),
		value
	});
	const chunks = [];
	for (const configuration of chunkConfigurations()) {
		console.error(`[Mitzvah World build] chunk:${configuration.name}`);
		chunks.push(await buildRuntimeChunk({ ...configuration, compileOnce: compileChunk, gameRoot }));
	}
	const { splitWorldChunk } = require('./split-world-chunk.cjs');
	const splitReceipt = splitWorldChunk();
	const finalizedWorld = finalizeSplitWorldChunk(gameRoot, splitReceipt);
	console.error('[Mitzvah World build] world split final identities:', JSON.stringify(finalizedWorld));
	const preloadIdentity = buildRuntimeChunkPreloadIdentity(gameRoot);
	console.error('[Mitzvah World build] preload identity:', JSON.stringify(preloadIdentity));
	console.log(JSON.stringify({ chunks, essentialAssets, finalizedWorld, main: mainManifest, preloadIdentity, worldSplit: splitReceipt }));
}

/** Compiles the tiny first-control graph with its necessary source map. */
function compileMain(entryFile) {
	return compileSource(entryFile, true, true);
}

/** Compiles one deferred chunk with only its requested dynamic import policy. */
function compileChunk(entryFile, options = {}) {
	return compileSource(entryFile, options.preserveDynamicImports === true, false);
}

/** Invokes the repository-owned compact compiler over the public source graph. */
function compileSource(entryFile, preserveDynamicImports, sourceMaps) {
	return compile({ entryFile, fs: fs.promises, preserveDynamicImports, rootDir: publicRoot, sourceMaps });
}

/** Enumerates essential and deferred runtime bundles in deterministic order. */
function chunkConfigurations() {
	return [
		chunk('foundation', 'EretzWorldFoundation.js'),
		chunk('player', 'EretzEssentialAssetLoader.js'),
		chunk('core', 'BootstrapEssentialPrimeAssembly.js'),
		chunk('post-control', 'BootstrapPostControlHydration.js'),
		chunk('presentation', 'MinimalMeadowPresentationBundle.js'),
		chunk('world', 'MinimalMeadowWorldBundle.js', { preserveDynamicImports: true }),
		chunk('optional', 'MinimalMeadowOptionalBundle.js')
	];
}

/** Produces one immutable-style configuration for a named bundle output. */
function chunk(name, entryName, options = {}) {
	return {
		entryFile: path.join(sourceRoot, 'app', entryName),
		manifestFile: path.join(generatedRoot, `mitzvah-world-${name}.json`),
		name,
		outputFile: path.join(sourceRoot, `mitzvah-world-${name}.compact.js`),
		preserveDynamicImports: options.preserveDynamicImports === true
	};
}
