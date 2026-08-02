// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowNativeBootContract.test.mjs
 * @description Locks one compact visible entry and two explicit deferred gameplay boundaries.
 * The Awtsmoos reveals the visible road before every fuller garment descends;
 * Awtsmoos.com proves entry ownership, first-paint scheduling, bootstrap play, and optional richness.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const GAME_ROOT = 'geelooy/games/mitzvahWorld';

test('B"H production index eagerly loads only the compact entry', () => {
	const index = source('index.html');
	const scripts = [...index.matchAll(
		/<script type="module"[^>]+src="([^"]+)"/g
	)].map(match => match[1]);
	assert.equal(scripts.length, 1);
	assert.match(scripts[0], /mitzvah-world\.compact\.js/);
	assert.doesNotMatch(index, /MinimalMeadowMobileIntegration\.js/);
	assert.doesNotMatch(index, /MinimalUniversalApiExplorer\.js/);
});

test('B"H compact graph embeds the launcher but preserves the scheduler boundary', () => {
	const compact = source(
		'experiments/Awtsmoos/src/mitzvah-world.compact.js'
	);
	assert.match(compact, /@file MinimalSharedMeadowPage\.js/);
	assert.match(compact, /import\(FEATURE_SCHEDULER_URL\)/);
	assert.doesNotMatch(compact, /@file MinimalMeadowFeatureScheduler\.js/);
	assert.doesNotMatch(compact, /@file MinimalMeadowPlayerHydration\.js/);
	assert.doesNotMatch(compact, /@file MinimalMeadowFriendlyNpcs\.js/);
	assert.doesNotMatch(compact, /@file MinimalMeadowRichWorld\.js/);
});

test('B"H runtime begins features after one bounded visible opportunity', () => {
	const runtime = source(
		'experiments/Awtsmoos/src/app/createMinimalMeadowRuntime.js'
	);
	assert.match(runtime, /FIRST_PAINT_FALLBACK_MS/);
	assert.match(runtime, /firstVisibleOpportunity/);
	assert.match(runtime, /FEATURE_SCHEDULER_URL/);
	assert.match(runtime, /import\(FEATURE_SCHEDULER_URL\)/);
	assert.doesNotMatch(runtime, /installMinimalMeadowFeatures/);
});

test('B"H launcher conditionally owns mobile and API entries', () => {
	const launcher = source(
		'experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js'
	);
	const optional = source(
		'experiments/Awtsmoos/src/launcher/MinimalMeadowOptionalEntries.js'
	);
	assert.match(launcher, /installMinimalMeadowOptionalEntries/);
	assert.match(optional, /MinimalMeadowMobileIntegration\.js/);
	assert.match(optional, /MinimalUniversalApiExplorer\.js/);
	assert.match(optional, /AwtsmoosOpenApiExplorer/);
});

test('B"H scheduler opens bootstrap play and defers the rich installer', () => {
	const scheduler = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowFeatureScheduler.js'
	);
	const bundle = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowFeatureBundle.js'
	);
	assert.match(scheduler, /installMinimalMeadowBootstrapFeatures/);
	assert.match(scheduler, /RICH_FEATURE_BUNDLE_URL/);
	assert.match(scheduler, /resolveDeferredAppModuleUrl/);
	assert.match(scheduler, /importer\(RICH_FEATURE_BUNDLE_URL\)/);
	assert.match(scheduler, /optionalFeaturePromise/);
	assert.doesNotMatch(
		scheduler,
		/from '\.\/MinimalMeadowFeatureBundle\.js'/
	);
	assert.doesNotMatch(scheduler, /requestAnimationFrame/);
	assert.match(bundle, /import\('\.\/MinimalMeadowPlayerHydration\.js'\)/);
	assert.match(bundle, /import\('\.\/MinimalMeadowFriendlyNpcs\.js'\)/);
	assert.match(bundle, /MinimalMeadowWorldSystems\.js/);
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
