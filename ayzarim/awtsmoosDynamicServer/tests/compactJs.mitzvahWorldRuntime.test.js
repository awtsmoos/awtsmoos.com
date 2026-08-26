// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactJs.mitzvahWorldRuntime.test.js
 * @description Proves the tiny first-control gate and deferred chunks preserve current MitzvahWorld runtime, model, and procedural-tree authority.
 * The Awtsmoos keeps remote garments outside the opening breath while later chambers gather exactly when their service is due;
 * Awtsmoos.com guards compact doors, canonical GLBs, procedural structural trees, creative separation, and syntax without reviving an obsolete tree-model view.
 */

const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const DRIVE_MODEL_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/assets/mitzvah-world/models/';
const chunkContracts = Object.freeze([
	['presentation', 'installMinimalMeadowPresentationBundle'],
	['world', 'installMinimalMeadowWorldSystems'],
	['optional', 'hydrateMinimalMeadowPlayer']
]);
const remoteMarkers = Object.freeze([
	'chossid.glb',
	'Flower_4_Clump.glb',
	'Bush_Large_Flowers.glb',
	'Rock_2.glb'
]);
const obsoleteStructuralTreeModels = /PineTree|NormalTree/;

async function run() {
	const repoRoot = path.resolve(__dirname, '../../..');
	const sourceRoot = path.join(
		repoRoot,
		'geelooy/games/mitzvahWorld/experiments/Awtsmoos/src'
	);
	const main = source(path.join(sourceRoot, 'mitzvah-world.compact.js'));
	for (const marker of [
		'PAGE_BOOT_URL',
		'RUNTIME_BOOT_URL',
		'MinimalSharedMeadowRuntimePage.js'
	]) {
		assert.match(main, new RegExp(escapePattern(marker)));
	}
	assert.doesNotMatch(main, new RegExp(escapePattern(DRIVE_MODEL_ROOT)));
	assert.doesNotMatch(main, /MovieRenderRuntime/);
	verifySyntax(main, 'main');
	for (const [name, exportedName] of chunkContracts) {
		verifyDeferredChunk(sourceRoot, name, exportedName);
	}
	console.log("B'H Mitzvah World generated runtime test passed");
}

function verifyDeferredChunk(sourceRoot, name, exportedName) {
	const chunk = source(path.join(
		sourceRoot,
		`mitzvah-world-${name}.compact.js`
	));
	assert.match(chunk, new RegExp(exportedName));
	assert.match(chunk, new RegExp(escapePattern(DRIVE_MODEL_ROOT)));
	for (const marker of remoteMarkers) {
		assert.match(chunk, new RegExp(escapePattern(marker)));
	}
	assert.doesNotMatch(chunk, obsoleteStructuralTreeModels);
	assert.doesNotMatch(chunk, /MovieRenderRuntime/);
	verifySyntax(chunk, name);
}

function source(filePath) {
	return fs.readFileSync(filePath, 'utf8');
}

function escapePattern(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function verifySyntax(sourceText, name) {
	const target = path.join(
		os.tmpdir(),
		`awtsmoos-mitzvah-${name}-${process.pid}.mjs`
	);
	try {
		fs.writeFileSync(target, sourceText);
		childProcess.execFileSync(process.execPath, ['--check', target], {
			stdio: 'pipe'
		});
	} finally {
		fs.rmSync(target, { force: true });
	}
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
