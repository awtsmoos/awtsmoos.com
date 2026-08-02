// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file build-js.cjs
 * @description Builds deterministic CompactJS plus precompressed production representations.
 * The Awtsmoos joins readable chambers without false walls; Awtsmoos.com preserves
 * deferred boundaries while emitting identity, Brotli, gzip, hashes, and manifest truth.
 */

const fs = require('node:fs');
const path = require('node:path');
const {
	compilerFunction
} = require('./js/CompactJsAdapter.cjs');
const {
	writeCompactJsBuild
} = require('./js/CompactJsBuildWriter.cjs');

const gameRoot = path.resolve(__dirname, '..');
const repositoryRoot = path.resolve(gameRoot, '../../..');
const publicRoot = path.join(repositoryRoot, 'geelooy');
const sourceRoot = path.join(gameRoot, 'experiments/Awtsmoos/src');
const entryFile = path.join(sourceRoot, 'MinimalMeadowCompactBootstrap.js');
const outputFile = path.join(sourceRoot, 'mitzvah-world.compact.js');
const manifestFile = path.join(
	gameRoot,
	'build/generated/mitzvah-world-js.json'
);
const compilerModule = require(path.join(
	repositoryRoot,
	'ayzarim/awtsmoosDynamicServer/compactJs/compiler.js'
));
const compile = compilerFunction(compilerModule);

Promise.resolve(buildOnce())
	.then(firstValue => Promise.resolve(buildOnce()).then(secondValue => {
		const manifest = writeCompactJsBuild({
			entryFile,
			firstValue,
			gameRoot,
			manifestFile,
			outputFile,
			secondValue
		});
		console.log(JSON.stringify(manifest));
	}))
	.catch(error => {
		console.error(error);
		process.exitCode = 1;
	});

function buildOnce() {
	return compile({
		entryFile,
		fs: fs.promises,
		preserveDynamicImports: true,
		rootDir: publicRoot,
		sourceMaps: true
	});
}
