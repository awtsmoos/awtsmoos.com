// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactJs.mitzvahWorldRuntime.test.js
 * @description Proves compact bootstrap imports the scheduler while the rich bundle remains outside the graph.
 * The Awtsmoos folds each first-control vessel before the truthful readiness seal;
 * Awtsmoos.com keeps scheduler identity explicit and leaves the richer installer beyond the compact gate.
 */

const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs').promises;
const os = require('os');
const path = require('path');
const { compileCompactModule } = require('../compactJs/compiler.js');

const DRIVE_MODEL_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/assets/mitzvah-world/models/';

async function run() {
	const repoRoot = path.resolve(__dirname, '../../..');
	const rootDir = path.join(repoRoot, 'geelooy');
	const entryFile = path.join(
		rootDir,
		'games/mitzvahWorld/experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js'
	);
	const compactSource = await compileCompactModule({ entryFile, fs, rootDir });
	assert.match(compactSource, new RegExp(escapePattern(DRIVE_MODEL_ROOT)));
	assert.doesNotMatch(compactSource, /\/geelooy\/games\/mitzvahWorld\/assets\/models\//);
	assert.doesNotMatch(compactSource, /\/games\/mitzvahWorld\/assets\/models\//);
	assert.match(
		compactSource,
		/module\.scheduleMinimalMeadowFeatures\(runtime, environment, \{/
	);
	assert.match(compactSource, /MinimalMeadowFeatureScheduler\.js/);
	assert.match(compactSource, /function resolveDeferredAppModuleUrl\(/);
	assert.match(compactSource, /FEATURE_SCHEDULER_URL/);
	assert.doesNotMatch(compactSource, /MinimalMeadowFeatureBundle\.js/);
	assert.doesNotMatch(compactSource, /async function installMinimalMeadowFeatures\(/);
	assert.match(
		compactSource,
		/\/games\/mitzvahWorld\/experiments\/Awtsmoos\/src\/network\/MultiplayerOptionalUi\.js/
	);
	assert.doesNotMatch(
		compactSource,
		/this\.importer\(['"]\.\/MitzvahWorldChatPanel\.js['"]\)/
	);
	assert.match(compactSource, /throwMinimalMeadowFeatureFailure/);
	assert.doesNotMatch(compactSource, /settling-after-playable/);
	await verifySyntax(compactSource);
	console.log("B'H Mitzvah World compact runtime test passed");
}

function escapePattern(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function verifySyntax(source) {
	const target = path.join(
		os.tmpdir(),
		`awtsmoos-mitzvah-runtime-${process.pid}.mjs`
	);
	try {
		await fs.writeFile(target, source);
		childProcess.execFileSync(process.execPath, ['--check', target], {
			stdio: 'pipe'
		});
	} finally {
		await fs.unlink(target).catch(() => {});
	}
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
