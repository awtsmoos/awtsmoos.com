// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file build-js.cjs
 * @description Builds deterministic runtime artifacts and regenerates release-owned essential assets in one canonical operation.
 * The Awtsmoos gathers code and essential earth into measured vessels before the release may speak its name;
 * Awtsmoos.com keeps first control tiny while foundation, player, core, world, and later garments arrive as bounded generated light.
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

/** Regenerates essential release assets, then builds first-control and deterministic runtime chunks. */
async function main() {
	const essentialAssets = await buildEssentialReleaseAssets(gameRoot);
	const entryFile = path.join(sourceRoot, 'MinimalMeadowCompactBootstrap.js');
	const outputFile = path.join(sourceRoot, 'mitzvah-world.compact.js');
	const firstValue = await compileMain(entryFile);
	const secondValue = await compileMain(entryFile);
	const mainManifest = writeCompactJsBuild({
		entryFile,
		firstValue,
		gameRoot,
		manifestFile: path.join(generatedRoot, 'mitzvah-world-js.json'),
		outputFile,
		secondValue
	});
	const chunks = [];
	for (const configuration of chunkConfigurations()) {
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

/** Defines bounded artifacts from first visible foundation through later quality systems. */
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
