// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowNativeBootContract.test.mjs
 * @description Locks one compact entry and truthful staged boundaries for every fuller quality graph.
 * The Awtsmoos reveals the visible road before every complete garment descends;
 * Awtsmoos.com proves entry, first control, parallel presentation, world handoff, and optional quality.
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

test('B"H scheduler opens bootstrap play before parallel full-quality graphs', () => {
	const scheduler = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowFeatureScheduler.js'
	);
	const hydration = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowRichFeatureHydration.js'
	);
	const timing = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowRichHydrationScheduler.js'
	);
	const bundle = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowFeatureBundle.js'
	);
	const presentation = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowPresentationHydration.js'
	);
	const optional = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowOptionalHydration.js'
	);
	assert.match(scheduler, /installMinimalMeadowBootstrapFeatures/);
	assert.match(scheduler, /scheduleMinimalMeadowRichHydration/);
	assert.match(hydration, /RICH_FEATURE_BUNDLE_URL/);
	assert.match(hydration, /richFeatureHandoffPromise/);
	assert.match(timing, /requestAnimationFrame/);
	assert.match(timing, /requestIdleCallback/);
	assert.match(timing, /HYDRATION_FALLBACK_MILLISECONDS/);
	assert.match(bundle, /hydrateMinimalMeadowPresentation/);
	assert.match(bundle, /hydrateMinimalMeadowOptionalFeatures/);
	assert.match(bundle, /import\('\.\/MinimalMeadowWorldSystems\.js'\)/);
	assert.doesNotMatch(bundle, /MinimalMeadowPlayerHydration\.js/);
	assert.match(presentation, /MinimalMeadowUi\.js/);
	assert.match(presentation, /MinimalMeadowAnimationState\.js/);
	assert.match(optional, /MinimalMeadowPlayerHydration\.js/);
	assert.match(optional, /MinimalMeadowRendererEnhancement\.js/);
	assert.match(optional, /MinimalMeadowFriendlyNpcs\.js/);
	assert.match(optional, /MinimalMeadowVisualReadiness\.js/);
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
