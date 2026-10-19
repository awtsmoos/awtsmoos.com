// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file build-js.cjs
 * @description Builds first control before rich hydration, then seals critical chunks with byte-derived preload identities.
 * The Awtsmoos gives the Chossid feet before ornaments; Awtsmoos.com keeps the blocking gate lean,
 * while post-control abundance becomes a later generated vessel that may awaken only after playable truth.
 */

const fs = require('node:fs');
const path = require('node:path');
const { buildEssentialReleaseAssets } = require('./EssentialReleaseAssetBuilder.cjs');
const { buildRuntimeChunkPreloadIdentity } = require('./RuntimeChunkPreloadIdentity.cjs');
const { compilerFunction } = require('./js/CompactJsAdapter.cjs');
const { writeCompactJsBuild } = require('./js/CompactJsBuildWriter.cjs');
const { buildRuntimeChunk } = require('./js/RuntimeChunkBuild.cjs');

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

/** Regenerates assets, first control, deferred runtime chunks, and canonical preload identities. */
async function main() {
	console.error('[Mitzvah World build] essential assets');
	const skipAssets = process.argv.includes('--skip-assets');
	const essentialAssets = skipAssets
		? JSON.parse(fs.readFileSync(path.join(generatedRoot, 'mitzvah-world-essential-assets.json'), 'utf8'))
		: await buildEssentialReleaseAssets(gameRoot);
	if (skipAssets) console.error('[Mitzvah World build] essential assets: reused verified local manifest (--skip-assets)');
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
	console.error('[Mitzvah World build] world chunk split:', JSON.stringify(splitReceipt.chunkA || splitReceipt.skipped));
	const preloadIdentity = buildRuntimeChunkPreloadIdentity(gameRoot);
	console.error('[Mitzvah World build] preload identity:', JSON.stringify(preloadIdentity));
	console.log(JSON.stringify({ chunks, essentialAssets, main: mainManifest, preloadIdentity, worldSplit: splitReceipt }));
}

function compileMain(entryFile) {
	return compileSource(entryFile, true, true);
}

function compileChunk(entryFile, options = {}) {
	return compileSource(entryFile, options.preserveDynamicImports === true, false);
}

function compileSource(entryFile, preserveDynamicImports, sourceMaps) {
	return compile({ entryFile, fs: fs.promises, preserveDynamicImports, rootDir: publicRoot, sourceMaps });
}

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

function chunk(name, entryName, options = {}) {
	return {
		entryFile: path.join(sourceRoot, 'app', entryName),
		manifestFile: path.join(generatedRoot, `mitzvah-world-${name}.json`),
		name,
		outputFile: path.join(sourceRoot, `mitzvah-world-${name}.compact.js`),
		preserveDynamicImports: options.preserveDynamicImports === true
	};
}
