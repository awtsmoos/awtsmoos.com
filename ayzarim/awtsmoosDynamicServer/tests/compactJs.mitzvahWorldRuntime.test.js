// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactJs.mitzvahWorldRuntime.test.js
 * @description Proves all generated runtime artifacts are syntactically valid and own their intended surfaces.
 * The Awtsmoos lets compiler names change their garments while callable public truth remains stable;
 * Awtsmoos.com guards first control, three chunk doors, remote models, creative separation, and syntax.
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

async function run() {
	const repoRoot = path.resolve(__dirname, '../../..');
	const sourceRoot = path.join(
		repoRoot,
		'geelooy/games/mitzvahWorld/experiments/Awtsmoos/src'
	);
	const main = source(path.join(sourceRoot, 'mitzvah-world.compact.js'));
	assert.match(main, new RegExp(escapePattern(DRIVE_MODEL_ROOT)));
	for (const marker of [
		'FIRST_PAINT_FALLBACK_MS',
		'mitzvah-world-presentation.compact.js',
		'mitzvah-world-world.compact.js',
		'mitzvah-world-optional.compact.js'
	]) assert.match(main, new RegExp(escapePattern(marker)));
	assert.doesNotMatch(main, /MovieRenderRuntime/);
	verifySyntax(main, 'main');
	for (const [name, exportedName] of chunkContracts) {
		const chunk = source(path.join(
			sourceRoot,
			`mitzvah-world-${name}.compact.js`
		));
		assert.match(chunk, new RegExp(exportedName));
		assert.doesNotMatch(chunk, /MovieRenderRuntime/);
		verifySyntax(chunk, name);
	}
	console.log("B'H Mitzvah World generated runtime test passed");
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
