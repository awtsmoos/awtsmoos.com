// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowNativeBootContract.test.mjs
 * @description Locks direct compact publication, foldable orchestration, three quality chunks, and creative deferral.
 * The Awtsmoos reveals the playable road before every complete garment descends;
 * Awtsmoos.com proves canonical entry truth, chunk identity, handoff, and explicit creative doors.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const GAME_ROOT = 'geelooy/games/mitzvahWorld';

test('B"H production index owns one direct compact entry', () => {
	const index = source('index.html');
	const scripts = [...index.matchAll(
		/<script type="module"[^>]+src="([^"]+)"/g
	)].map(match => match[1]);
	assert.deepEqual(scripts, [
		'./experiments/Awtsmoos/src/mitzvah-world.compact.js'
	]);
	assert.doesNotMatch(index, /MitzvahWorldProductionEntry\.js/);
	assert.equal([...index.matchAll(/<link[^>]+stylesheet/g)].length, 1);
});

test('B"H scheduler and rich hydration preserve explicit module boundaries', () => {
	const runtime = source(
		'experiments/Awtsmoos/src/app/createMinimalMeadowRuntime.js'
	);
	const hydration = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowRichFeatureHydration.js'
	);
	assert.match(runtime, /import\('\.\/MinimalMeadowFeatureScheduler\.js'\)/);
	assert.doesNotMatch(runtime, /FEATURE_SCHEDULER_URL/);
	assert.match(hydration, /export const RICH_FEATURE_BUNDLE_URL = new URL/);
	assert.match(hydration, /'\.\/MinimalMeadowFeatureBundle\.js'/);
	assert.match(hydration, /import\(RICH_FEATURE_BUNDLE_URL\)/);
});

test('B"H feature orchestration names exactly three generated chunks', () => {
	const feature = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowFeatureBundle.js'
	);
	const presentation = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowPresentationHydration.js'
	);
	const optional = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowOptionalHydration.js'
	);
	assert.match(feature, /mitzvah-world-world\.compact\.js/);
	assert.match(presentation, /mitzvah-world-presentation\.compact\.js/);
	assert.match(optional, /mitzvah-world-optional\.compact\.js/);
	for (const name of ['handoffPromise', 'presentationPromise', 'optionalPromise']) {
		assert.match(feature, new RegExp(name));
	}
});

test('B"H generated chunk entries preserve complete installer surfaces', () => {
	const presentation = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowPresentationBundle.js'
	);
	const world = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowWorldBundle.js'
	);
	const optional = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowOptionalBundle.js'
	);
	assert.match(presentation, /installMinimalMeadowUi/);
	assert.match(presentation, /installMinimalMeadowAnimation/);
	assert.match(world, /installMinimalMeadowWorldSystems/);
	for (const name of [
		'hydrateMinimalMeadowPlayer',
		'enhanceMinimalMeadowRenderer',
		'installMinimalMeadowFriendlyNpcs',
		'awaitMinimalMeadowVisualStability'
	]) assert.match(optional, new RegExp(name));
});

test('B"H only creative mode owners preserve literal imports', () => {
	const preservation = source('build/js/PreservedDynamicImportFs.cjs');
	assert.match(preservation, /MitzvahWorldCreativeModeLoaders\.js/);
	assert.match(preservation, /MitzvahWorldModeLoaders\.js/);
	assert.doesNotMatch(preservation, /EretzStagedRuntime\.js/);
	assert.doesNotMatch(preservation, /MinimalMeadowFeatureScheduler\.js/);
});

test('B"H native facade remains an explicit-binding module contract', () => {
	const facade = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowTreeCoreFacade.js'
	);
	assert.match(facade, /import\s*\{/);
	assert.match(facade, /export function generateTreeProceduralData/);
	assert.doesNotMatch(facade, /export\s*\{[\s\S]*?\}\s*from/);
});

function source(relativePath) {
	return fs.readFileSync(`${GAME_ROOT}/${relativePath}`, 'utf8');
}
