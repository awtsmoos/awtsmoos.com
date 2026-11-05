// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file measure-essential-prime.cjs
 * @description Compiles the strict visible-canonical plus collision-aware movement prime twice before it may become production authority.
 * The Awtsmoos weighs body, earth, step, and rendered witness before opening the final gate;
 * Awtsmoos.com lets deterministic bytes decide whether this narrow vessel truly outruns the old core weight.
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { compilerFunction, compactResult } = require('./js/CompactJsAdapter.cjs');

const gameRoot = path.resolve(__dirname, '..');
const repositoryRoot = path.resolve(gameRoot, '../../..');
const publicRoot = path.join(repositoryRoot, 'geelooy');
const entryFile = path.join(gameRoot, 'experiments/Awtsmoos/src/app/BootstrapEssentialPrimeAssembly.js');
const currentCore = JSON.parse(fs.readFileSync(path.join(gameRoot, 'build/generated/mitzvah-world-core.json'), 'utf8'));
const compilerModule = require(path.join(repositoryRoot, 'ayzarim/awtsmoosDynamicServer/compactJs/compiler.js'));
const compile = compilerFunction(compilerModule);

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

/** Compiles twice and prints deterministic savings against the current production core. */
async function main() {
	const first = normalize(await compileOnce());
	const second = normalize(await compileOnce());
	const firstHash = sha(first.code);
	if (firstHash !== sha(second.code)) throw new Error('ESSENTIAL_PRIME_NONDETERMINISTIC');
	const bytes = Buffer.from(first.code);
	console.log(`ESSENTIAL_PRIME_MEASUREMENT ${JSON.stringify({
		baselineBytes: currentCore.outputBytes,
		brotliBytes: zlib.brotliCompressSync(bytes).byteLength,
		gzipBytes: zlib.gzipSync(bytes).byteLength,
		modules: first.modules,
		outputBytes: bytes.byteLength,
		outputHash: firstHash,
		ratioToCurrentCore: bytes.byteLength / currentCore.outputBytes,
		savingsBytes: currentCore.outputBytes - bytes.byteLength
	})}`);
}

function compileOnce() {
	return compile({ entryFile, fs: fs.promises, preserveDynamicImports: false, rootDir: publicRoot, sourceMaps: false });
}

function normalize(value) {
	const result = compactResult(value);
	return { code: String(result.code || '').replace(/\r\n/g, '\n'), modules: result.modules || [] };
}

function sha(value) {
	return crypto.createHash('sha256').update(value).digest('hex');
}
