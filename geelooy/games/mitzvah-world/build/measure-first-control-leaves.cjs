// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file measure-first-control-leaves.cjs
 * @description Measures the heavy leaves beneath player and loop so first-play splitting follows exact compiled weight.
 * The Awtsmoos reveals weight leaf by leaf before the branch is cut;
 * Awtsmoos.com lets animation, movement, player install, and milestone law testify separately so Gevurah divides only what measured truth instructs.
 */

const fs = require('node:fs');
const path = require('node:path');
const { compilerFunction, compactResult } = require('./js/CompactJsAdapter.cjs');

const gameRoot = path.resolve(__dirname, '..');
const repositoryRoot = path.resolve(gameRoot, '../../..');
const publicRoot = path.join(repositoryRoot, 'geelooy');
const sourceRoot = path.join(gameRoot, 'experiments/Awtsmoos/src/app');
const compilerModule = require(path.join(repositoryRoot, 'ayzarim/awtsmoosDynamicServer/compactJs/compiler.js'));
const compile = compilerFunction(compilerModule);
const ENTRIES = Object.freeze({
	animation: 'EretzAnimationMotion.js',
	essentialBoot: 'MitzvahWorldEssentialBoot.js',
	frameExecution: 'BootstrapFrameExecution.js',
	movement: 'BootstrapMovementController.js',
	playerFactories: 'EretzPlayerRuntimeFactories.js',
	playerInstall: 'MinimalMeadowCanonicalPlayerInstall.js'
});

main().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

/** Compiles each leaf independently and prints one compact comparison receipt. */
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
		receipt[name] = Buffer.byteLength(String(result.code || ''));
	}
	console.log(`FIRST_CONTROL_LEAVES ${JSON.stringify(receipt)}`);
}
