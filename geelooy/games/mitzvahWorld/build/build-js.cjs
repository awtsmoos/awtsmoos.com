// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file build-js.cjs
 * @description Builds deterministic first-control, bounded playable foundation/core, and later quality runtime artifacts while preserving chosen deferred seams.
 * The Awtsmoos gathers each needed phase into a vessel no larger than its present deed;
 * Awtsmoos.com lets first control stay tiny, playable ground cross two swift compressed gates, and distant beauty remain deferred at speed.
 */

const fs = require('node:fs');
const path = require('node:path');
const {
	compilerFunction
} = require('./js/CompactJsAdapter.cjs');
const {
	writeCompactJsBuild
} = require('./js/CompactJsBuildWriter.cjs');
const {
	buildRuntimeChunk
} = require('./js/RuntimeChunkBuild.cjs');

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

/** Builds the first-control artifact followed by deterministic playable and later runtime chunks. */
async function main() {
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
	console.log(JSON.stringify({ chunks, main: mainManifest }));
}

/** Compiles the tiny first-control entry while preserving every later dynamic boundary. */
function compileMain(entryFile) {
	return compileSource(entryFile, true, true);
}

/** Compiles one runtime chunk with its explicitly chosen dynamic-import policy. */
function compileChunk(entryFile, options = {}) {
	return compileSource(
		entryFile,
		options.preserveDynamicImports === true,
		false
	);
}

/** Invokes the canonical compiler with one explicit source-map and dynamic-import covenant. */
function compileSource(entryFile, preserveDynamicImports, sourceMaps) {
	return compile({
		entryFile,
		fs: fs.promises,
		preserveDynamicImports,
		rootDir: publicRoot,
		sourceMaps
	});
}

/** Defines bounded artifacts from playable foundation through later quality systems. */
function chunkConfigurations() {
	return [
		chunk('foundation', 'EretzWorldFoundation.js'),
		chunk('core', 'BootstrapCoreRuntimeAssembly.js'),
		chunk('presentation', 'MinimalMeadowPresentationBundle.js'),
		chunk('world', 'MinimalMeadowWorldBundle.js', { preserveDynamicImports: true }),
		chunk('optional', 'MinimalMeadowOptionalBundle.js')
	];
}

/** Creates one deterministic build descriptor consumed by RuntimeChunkBuild. */
function chunk(name, entryName, options = {}) {
	return {
		entryFile: path.join(sourceRoot, 'app', entryName),
		manifestFile: path.join(generatedRoot, `mitzvah-world-${name}.json`),
		name,
		outputFile: path.join(sourceRoot, `mitzvah-world-${name}.compact.js`),
		preserveDynamicImports: options.preserveDynamicImports === true
	};
}
