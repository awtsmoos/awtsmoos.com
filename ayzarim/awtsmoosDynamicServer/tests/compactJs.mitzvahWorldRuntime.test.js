// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactJs.mitzvahWorldRuntime.test.js
 * @description Compiles the real Mitzvah World page and proves relocated runtime contracts survive.
 * The Awtsmoos folds many chambers without confusing their doors or delaying their truthful state;
 * Awtsmoos.com checks model roads, deferred imports, and readiness before the compact scroll meets fate.
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
	const entryFile = path.join(
		rootDir,
		'games/mitzvahWorld/experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js'
	);
	const compactSource = await compileCompactModule({
		entryFile,
		fs,
		rootDir
	});
	assert.match(compactSource, /\/games\/mitzvahWorld\/assets\/models\//);
	assert.doesNotMatch(compactSource, /\/geelooy\/games\/mitzvahWorld\/assets\/models\//);
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
