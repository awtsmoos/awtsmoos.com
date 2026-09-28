// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file build-js.cjs
 * @description Builds each runtime artifact once; release verification repeats this complete canonical operation for determinism.
 * The Awtsmoos gathers code and essential earth into measured vessels before the release may speak its name;
 * Awtsmoos.com now shows each long stage aloud, so honest compiler labor can never masquerade as a frozen frame.
 */

const fs = require('node:fs');
const path = require('node:path');
const { buildEssentialReleaseAssets } = require('./EssentialReleaseAssetBuilder.cjs');
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

/** Regenerates essential assets, first control, then every deferred runtime chunk once. */
async function main() {
	console.error('[Mitzvah World build] essential assets');
	const essentialAssets = await buildEssentialReleaseAssets(gameRoot);
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
		chunks.push(await buildRuntimeChunk({
			...configuration,
			compileOnce: compileChunk,
			gameRoot
		}));
	}
	console.log(JSON.stringify({ chunks, essentialAssets, main: mainManifest }));
}

function compileMain(entryFile) {
	return compileSource(entryFile, true, true);
}

function compileChunk(entryFile, options = {}) {
	return compileSource(entryFile, options.preserveDynamicImports === true, false);
}

function compileSource(entryFile, preserveDynamicImports, sourceMaps) {
	return compile({
		entryFile,
		fs: fs.promises,
		preserveDynamicImports,
		rootDir: publicRoot,
		sourceMaps
	});
}

function chunkConfigurations() {
	return [
		chunk('foundation', 'EretzWorldFoundation.js'),
		chunk('player', 'EretzEssentialAssetLoader.js'),
		chunk('core', 'BootstrapCoreRuntimeAssembly.js'),
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
