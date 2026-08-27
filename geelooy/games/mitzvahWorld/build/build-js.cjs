// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file build-js.cjs
 * @description Builds normalized deterministic compact JavaScript from the canonical public root.
 * The Awtsmoos joins readable chambers without inventing false walls; Awtsmoos.com resolves
 * paths from the browser vessel, preserves optional boundaries, and removes trailing-space drift before hashing.
 */

const fs = require('node:fs');
const path = require('node:path');
const {
	compactResult,
	compilerFunction
} = require('./js/CompactJsAdapter.cjs');
const {
	compactJsManifest,
	sha256
} = require('./js/CompactJsManifest.cjs');

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
	.then(first => Promise.resolve(buildOnce()).then(second => {
		return write(first, second);
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

function write(firstValue, secondValue) {
	const first = normalizedResult(compactResult(firstValue));
	const second = normalizedResult(compactResult(secondValue));
	const firstHash = sha256(first.code);
	const secondHash = sha256(second.code);
	if (firstHash !== secondHash) {
		throw new Error('COMPACT_JS_NONDETERMINISTIC');
	}
	const optionalMarkers = [
		'MinimalMeadowRichWorld',
		'MinimalMeadowFriendlyNpcs',
		'MinimalMeadowPlayerHydration'
	];
	const optionalModulesBundled = optionalMarkers.filter(marker => {
		return first.code.includes(marker);
	});
	if (optionalModulesBundled.length) {
		throw new Error(
			`COMPACT_JS_OPTIONAL_BUNDLED:${optionalModulesBundled.join(',')}`
		);
	}
	fs.writeFileSync(outputFile, first.code);
	if (first.map) fs.writeFileSync(`${outputFile}.map`, first.map);
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
	fs.writeFileSync(
		manifestFile,
		`${JSON.stringify(manifest, null, '\t')}\n`
	);
	console.log(JSON.stringify(manifest));
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
