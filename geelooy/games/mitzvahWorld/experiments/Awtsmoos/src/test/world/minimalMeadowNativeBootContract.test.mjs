// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowNativeBootContract.test.mjs
 * @description Locks one production switch, compact-default boot, three quality chunks, and creative-only deferral.
 * The Awtsmoos reveals the playable road before every complete garment descends;
 * Awtsmoos.com proves canonical entry truth, critical folding, chunk identity, handoff, and creative doors.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const GAME_ROOT = 'geelooy/games/mitzvahWorld';

test('B"H production index owns one compact-default entry switch', () => {
	const index = source('index.html');
	const entry = source(
		'experiments/Awtsmoos/src/MitzvahWorldProductionEntry.js'
	);
	const scripts = [...index.matchAll(
		/<script type="module"[^>]+src="([^"]+)"/g
	)].map(match => match[1]);
	assert.deepEqual(scripts, [
		'./experiments/Awtsmoos/src/MitzvahWorldProductionEntry.js'
	]);
	assert.match(entry, /parameters\.get\('readable'\) === '1'/);
	assert.match(entry, /: '\.\/mitzvah-world\.compact\.js'/);
	assert.equal([...index.matchAll(/<link[^>]+stylesheet/g)].length, 1);
});

test('B"H required scheduler and feature orchestration use foldable imports', () => {
	const runtime = source(
		'experiments/Awtsmoos/src/app/createMinimalMeadowRuntime.js'
	);
	const hydration = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowRichFeatureHydration.js'
	);
	assert.match(runtime, /import\('\.\/MinimalMeadowFeatureScheduler\.js'\)/);
	assert.doesNotMatch(runtime, /FEATURE_SCHEDULER_URL/);
	assert.match(hydration, /import\('\.\/MinimalMeadowFeatureBundle\.js'\)/);
	assert.doesNotMatch(hydration, /RICH_FEATURE_BUNDLE_URL/);
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
	assert.match(feature, /handoffPromise/);
	assert.match(feature, /presentationPromise/);
	assert.match(feature, /optionalPromise/);
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

test('B"H only creative mode owners may preserve literal imports', () => {
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
