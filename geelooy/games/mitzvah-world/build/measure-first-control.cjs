// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file measure-first-control.cjs
 * @description Compiles the experimental movement-only runtime twice and compares its deterministic weight against the current generated core.
 * The Awtsmoos weighs a proposed vessel before it receives authority in the living world;
 * Awtsmoos.com lets bytes testify first, so architecture changes only when measured light is truly unfurled.
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { compilerFunction, compactResult } = require('./js/CompactJsAdapter.cjs');

const gameRoot = path.resolve(__dirname, '..');
const repositoryRoot = path.resolve(gameRoot, '../../..');
const publicRoot = path.join(repositoryRoot, 'geelooy');
const entryFile = path.join(
	gameRoot,
	'experiments/Awtsmoos/src/app/BootstrapFirstControlRuntimeAssembly.js'
);
const currentManifest = JSON.parse(fs.readFileSync(
	path.join(gameRoot, 'build/generated/mitzvah-world-core.json'),
	'utf8'
));
const compilerModule = require(path.join(
	repositoryRoot,
	'ayzarim/awtsmoosDynamicServer/compactJs/compiler.js'
));
const compile = compilerFunction(compilerModule);

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

/** Compiles twice, verifies stable identity, and prints one comparison receipt without writing production artifacts. */
async function main() {
	const first = normalize(await compileOnce());
	const second = normalize(await compileOnce());
	const firstHash = sha(first.code);
	const secondHash = sha(second.code);
	if (firstHash !== secondHash) throw new Error('FIRST_CONTROL_EXPERIMENT_NONDETERMINISTIC');
	const bytes = Buffer.from(first.code);
	const receipt = Object.freeze({
		baselineBytes: currentManifest.outputBytes,
		brotliBytes: zlib.brotliCompressSync(bytes).byteLength,
		deterministic: true,
		gzipBytes: zlib.gzipSync(bytes).byteLength,
		modules: first.modules,
		outputBytes: bytes.byteLength,
		outputHash: firstHash,
		ratioToCurrentCore: bytes.byteLength / currentManifest.outputBytes,
		savingsBytes: currentManifest.outputBytes - bytes.byteLength
	});
	console.log(`FIRST_CONTROL_MEASUREMENT ${JSON.stringify(receipt)}`);
}

function compileOnce() {
	return compile({
		entryFile,
		fs: fs.promises,
		preserveDynamicImports: false,
		rootDir: publicRoot,
		sourceMaps: false
	});
}

function normalize(value) {
	const result = compactResult(value);
	return {
		code: String(result.code || '').replace(/\r\n/g, '\n'),
		modules: result.modules || []
	};
}

function sha(value) {
	return crypto.createHash('sha256').update(value).digest('hex');
}
