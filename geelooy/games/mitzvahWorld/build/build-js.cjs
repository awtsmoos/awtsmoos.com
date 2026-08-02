// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file build-js.cjs
 * @description Builds deterministic first-control, presentation, world, and optional runtime artifacts.
 * The Awtsmoos gathers each complete phase into its own compressed vessel;
 * Awtsmoos.com preserves swift play, full quality, creative boundaries, hashes, and manifests.
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

function compileMain(entryFile) {
	return compile({
		entryFile,
		fs: fs.promises,
		preserveDynamicImports: true,
		rootDir: publicRoot,
		sourceMaps: true
	});
}

function compileChunk(entryFile) {
	return compile({
		entryFile,
		fs: fs.promises,
		preserveDynamicImports: false,
		rootDir: publicRoot,
		sourceMaps: false
	});
}

function chunkConfigurations() {
	return [
		chunk('presentation', 'MinimalMeadowPresentationBundle.js'),
		chunk('world', 'MinimalMeadowWorldBundle.js'),
		chunk('optional', 'MinimalMeadowOptionalBundle.js')
	];
}

function chunk(name, entryName) {
	return {
		entryFile: path.join(sourceRoot, 'app', entryName),
		manifestFile: path.join(generatedRoot, `mitzvah-world-${name}.json`),
		name,
		outputFile: path.join(sourceRoot, `mitzvah-world-${name}.compact.js`)
	};
}
