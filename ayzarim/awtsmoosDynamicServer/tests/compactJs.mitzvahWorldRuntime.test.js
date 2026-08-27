// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactJs.mitzvahWorldRuntime.test.js
 * @description Proves map-aware essentials, telemetry, and watchdog remain folded while map and richness stay deferred.
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
	const source = await compileCompactModule({ entryFile, fs, rootDir });
	assert.match(source, new RegExp(escapePattern(DRIVE_MODEL_ROOT)));
	assert.doesNotMatch(source, /\/games\/mitzvahWorld\/assets\/models\//);
	assert.match(source, /function scheduleMinimalMeadowFeatures\(/);
	assert.match(source, /function hydrateMinimalMeadowRichFeatures\(/);
	assert.match(source, /function awaitMinimalMeadowBootstrapReadiness\(/);
	assert.match(source, /function createMinimalMeadowBootTimeline\(/);
	assert.match(source, /function awaitEssentialFeatureReceipt\(/);
	assert.match(source, /MINIMAL_MEADOW_MINIMAP_UNAVAILABLE/);
	assert.match(source, /MINIMAL_MEADOW_ESSENTIAL_TIMEOUT/);
	assert.match(source, /WorldMinimap\.js/);
	assert.match(source, /MinimalMeadowFeatureBundle\.js/);
	assert.doesNotMatch(source, /async function installMinimalMeadowFeatures\(/);
	assert.doesNotMatch(source, /function createWorldMinimapRoot\(/);
	assert.doesNotMatch(source, /FEATURE_SCHEDULER_URL/);
	assert.match(source, /throwMinimalMeadowFeatureFailure/);
	assert.doesNotMatch(source, /settling-after-playable/);
	await verifySyntax(source);
	console.log("B'H Mitzvah World compact runtime test passed");
}

function escapePattern(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function verifySyntax(source) {
	const target = path.join(os.tmpdir(), `awtsmoos-runtime-${process.pid}.mjs`);
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
