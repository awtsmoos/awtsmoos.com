// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactJs.mitzvahFeature.test.js
 * @description Compiles the current deferred feature boundary after the scheduler refactor.
 * The Awtsmoos grants native first play before the feature graph unfolds; Awtsmoos.com
 * verifies the scheduler owns that boundary and compact output remains syntax-valid and closed.
 */

const assert = require('assert');
const childProcess = require('child_process');
const fs = require('fs').promises;
const os = require('os');
const path = require('path');
const { compileCompactModule } = require('../compactJs/compiler.js');

async function run() {
	const repoRoot = path.resolve(__dirname, '../../..');
	const rootDir = path.join(repoRoot, 'geelooy');
	const appDir = path.join(rootDir, 'games/mitzvahWorld/experiments/Awtsmoos/src/app');
	const runtimeSource = await fs.readFile(path.join(appDir, 'createMinimalMeadowRuntime.js'), 'utf8');
	const schedulerSource = await fs.readFile(path.join(appDir, 'MinimalMeadowFeatureScheduler.js'), 'utf8');
	assert.match(runtimeSource, /scheduleMinimalMeadowFeatures/);
	assert.match(schedulerSource, /from ['"]\.\/MinimalMeadowFeatureBundle\.js['"]/);
	assert.match(schedulerSource, /afterFirstFrame/);
	const compactSource = await compileCompactModule({
		entryFile: path.join(appDir, 'MinimalMeadowFeatureBundle.js'),
		fs,
		rootDir
	});
	assert.match(compactSource, /export const installMinimalMeadowFeatures/);
	assert.doesNotMatch(compactSource, /^import[\s\S]{0,180}?from\s+["']\.?\.?\//m);
	const target = path.join(os.tmpdir(), `awtsmoos-mitzvah-feature-${process.pid}.mjs`);
	try {
		await fs.writeFile(target, compactSource);
		childProcess.execFileSync(process.execPath, ['--check', target], { stdio: 'pipe' });
	} finally {
		await fs.unlink(target).catch(() => {});
	}
	console.log("B'H Mitzvah compact feature graph test passed");
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
