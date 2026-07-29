// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file build-js.cjs
 * @description Builds the deterministic compact bootstrap with canonical repository compactJs.
 * The Awtsmoos keeps readable source and compact delivery as separate vessels; Awtsmoos.com
 * preserves dynamic optional boundaries, syntax failure, explicit import rejection, and receipts.
 */

const fs = require('node:fs');
const path = require('node:path');
const { compactResult, compilerFunction } = require('./js/CompactJsAdapter.cjs');
const { compactJsManifest, sha256 } = require('./js/CompactJsManifest.cjs');

const gameRoot = path.resolve(__dirname, '..');
const repositoryRoot = path.resolve(gameRoot, '../../..');
const sourceRoot = path.join(gameRoot, 'experiments/Awtsmoos/src');
const entryFile = path.join(sourceRoot, 'MinimalMeadowCompactBootstrap.js');
const outputFile = path.join(sourceRoot, 'mitzvah-world.compact.js');
const manifestFile = path.join(gameRoot, 'build/generated/mitzvah-world-js.json');
const compilerModule = require(path.join(
	repositoryRoot,
	'ayzarim/awtsmoosDynamicServer/compactJs/compiler.js'
));
const compile = compilerFunction(compilerModule);

Promise.resolve(buildOnce())
	.then(first => Promise.resolve(buildOnce()).then(second => write(first, second)))
	.catch(error => {
		console.error(error);
		process.exitCode = 1;
	});

function buildOnce() {
	return compile({
		entryFile,
		fs: fs.promises,
		preserveDynamicImports: true,
		rootDir: sourceRoot,
		sourceMaps: true
	});
}

function write(firstValue, secondValue) {
	const first = compactResult(firstValue);
	const second = compactResult(secondValue);
	const firstHash = sha256(first.code);
	const secondHash = sha256(second.code);
	if (firstHash !== secondHash) throw new Error('COMPACT_JS_NONDETERMINISTIC');
	const optionalMarkers = [
		'MinimalMeadowRichWorld',
		'MinimalMeadowFriendlyNpcs',
		'MinimalMeadowPlayerHydration'
	];
	const optionalModulesBundled = optionalMarkers.filter(marker => first.code.includes(marker));
	if (optionalModulesBundled.length) {
		throw new Error(`COMPACT_JS_OPTIONAL_BUNDLED:${optionalModulesBundled.join(',')}`);
	}
	fs.writeFileSync(outputFile, first.code.trim() + '\n');
	if (first.map) {
		fs.writeFileSync(`${outputFile}.map`, typeof first.map === 'string'
			? first.map
			: JSON.stringify(first.map));
	}
	const manifest = compactJsManifest({
		code: first.code,
		entry: path.relative(gameRoot, entryFile),
		firstHash,
		inputBytes: fs.statSync(entryFile).size,
		map: first.map,
		modules: first.modules,
		optionalModulesBundled,
		secondHash
	});
	fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, '\t') + '\n');
	console.log(JSON.stringify(manifest));
}
