// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactJs.mitzvahFeature.test.js
 * @description Compiles the current bootstrap-rich feature boundary after scheduler evolution.
 * The Awtsmoos grants essential play through the nearest vessel while richer garments grow;
 * Awtsmoos.com verifies compact output preserves both the bootstrap root and optional flow.
 */

const assert = require('assert');
const {
	assertSyntax,
	compileCompactModule,
	fs,
	path
} = require('./compactJsTestSupport.js');

async function run() {
	const repositoryRoot = path.resolve(__dirname, '../../..');
	const rootDir = path.join(repositoryRoot, 'geelooy');
	const appDir = path.join(
		rootDir,
		'games/mitzvahWorld/experiments/Awtsmoos/src/app'
	);
	const runtimeSource = await fs.readFile(
		path.join(appDir, 'createMinimalMeadowRuntime.js'),
		'utf8'
	);
	const schedulerSource = await fs.readFile(
		path.join(appDir, 'MinimalMeadowFeatureScheduler.js'),
		'utf8'
	);
	assert.match(runtimeSource, /scheduleMinimalMeadowFeatures/);
	assert.match(schedulerSource, /installMinimalMeadowBootstrapFeatures/);
	assert.match(schedulerSource, /Promise\.resolve\(\)\.then/);
	assert.match(schedulerSource, /optionalFeaturePromise/);
	assert.doesNotMatch(schedulerSource, /afterFirstFrame/);
	const compactSource = await compileCompactModule({
		entryFile: path.join(appDir, 'MinimalMeadowFeatureBundle.js'),
		fs,
		rootDir
	});
	assert.match(compactSource, /export const installMinimalMeadowFeatures/);
	assert.doesNotMatch(
		compactSource,
		/^import[\s\S]{0,180}?from\s+["']\.?\.?\//m
	);
	await assertSyntax(compactSource, 'mitzvah-feature-bundle');
	console.log("B'H Mitzvah compact feature graph test passed");
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
