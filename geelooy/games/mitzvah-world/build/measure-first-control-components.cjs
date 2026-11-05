// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file measure-first-control-components.cjs
 * @description Compiles player, loop, and combined first-control cones independently so the next split follows measured weight rather than intuition.
 * The Awtsmoos weighs each hidden vessel before deciding where Gevurah should divide the stream;
 * Awtsmoos.com lets player and heartbeat reveal their own byte burden, so the smallest first-play architecture may emerge from evidence, not dream.
 */

const fs = require('node:fs');
const path = require('node:path');
const { compilerFunction, compactResult } = require('./js/CompactJsAdapter.cjs');

const gameRoot = path.resolve(__dirname, '..');
const repositoryRoot = path.resolve(gameRoot, '../../..');
const publicRoot = path.join(repositoryRoot, 'geelooy');
const sourceRoot = path.join(gameRoot, 'experiments/Awtsmoos/src/app');
const compilerModule = require(path.join(
	repositoryRoot,
	'ayzarim/awtsmoosDynamicServer/compactJs/compiler.js'
));
const compile = compilerFunction(compilerModule);
const ENTRIES = Object.freeze({
	combined: 'BootstrapFirstControlRuntimeAssembly.js',
	loop: 'BootstrapRuntimeLoop.js',
	player: 'BootstrapPlayerRuntime.js'
});

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

/** Compiles each cone once for comparative measurement only; production determinism remains covered by the full experiment. */
async function main() {
	const receipt = {};
	for (const [name, fileName] of Object.entries(ENTRIES)) {
		const result = compactResult(await compile({
			entryFile: path.join(sourceRoot, fileName),
			fs: fs.promises,
			preserveDynamicImports: false,
			rootDir: publicRoot,
			sourceMaps: false
		}));
		receipt[name] = Object.freeze({
			bytes: Buffer.byteLength(String(result.code || '')),
			modules: result.modules || []
		});
	}
	console.log(`FIRST_CONTROL_COMPONENTS ${JSON.stringify(receipt)}`);
}
