// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowNativeBootContract.test.mjs
 * @description Locks one compact entry, map-aware essentials, measured boot, and deferred richness.
 * The Awtsmoos reveals mechanics and the promise of a truthful map inside one compact light;
 * Awtsmoos.com preserves map implementation and richer garments beyond source-aware boundaries.
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

test('B"H compact graph folds measured map-aware essentials', () => {
	const compact = source(
		'experiments/Awtsmoos/src/mitzvah-world.compact.js'
	);
	for (const filename of [
		'MinimalMeadowFeatureScheduler.js',
		'MinimalMeadowRichFeatureScheduler.js',
		'MinimalMeadowBootstrapReadiness.js',
		'MinimalMeadowBootTimeline.js',
		'MinimalMeadowEssentialFeatureGate.js'
	]) {
		assert.match(compact, new RegExp(`@file ${filename.replace('.', '\\.')}`));
	}
	assert.match(compact, /MINIMAL_MEADOW_MINIMAP_UNAVAILABLE/);
	assert.match(compact, /WorldMinimap\.js/);
	assert.match(compact, /MinimalMeadowFeatureBundle\.js/);
	assert.doesNotMatch(compact, /FEATURE_SCHEDULER_URL/);
	assert.doesNotMatch(compact, /@file WorldMinimapView\.js/);
	assert.doesNotMatch(compact, /@file MinimalMeadowPlayerHydration\.js/);
});

test('B"H runtime begins measured essentials after one paint gate', () => {
	const runtime = source(
		'experiments/Awtsmoos/src/app/createMinimalMeadowRuntime.js'
	);
	assert.match(runtime, /FIRST_PAINT_FALLBACK_MS/);
	assert.match(runtime, /firstVisibleOpportunity/);
	assert.match(runtime, /scheduleMinimalMeadowFeatures/);
	assert.match(runtime, /createMinimalMeadowBootTimeline/);
	assert.match(runtime, /awaitEssentialFeatureReceipt/);
	assert.match(runtime, /essentialFeatureTimeoutMs/);
	assert.doesNotMatch(runtime, /FEATURE_SCHEDULER_URL/);
});

test('B"H essential scheduler awaits the real map before rich hydration', () => {
	const scheduler = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowFeatureScheduler.js'
	);
	const readiness = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowBootstrapReadiness.js'
	);
	assert.match(scheduler, /awaitMinimalMeadowBootstrapReadiness/);
	assert.match(scheduler, /hydrateMinimalMeadowRichFeatures/);
	assert.match(scheduler, /essential-bootstrap-installed/);
	assert.match(scheduler, /essential-ready/);
	assert.match(readiness, /bootstrap-minimap-wait/);
	assert.match(readiness, /bootstrap-minimap-ready/);
	assert.match(readiness, /MINIMAL_MEADOW_MINIMAP_UNAVAILABLE/);
});

test('B"H rich coordinator owns the only heavy dynamic boundary', () => {
	const rich = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowRichFeatureScheduler.js'
	);
	const bundle = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowFeatureBundle.js'
	);
	assert.match(rich, /RICH_FEATURE_BUNDLE_URL/);
	assert.match(rich, /resolveDeferredAppModuleUrl/);
	assert.match(rich, /importer\(RICH_FEATURE_BUNDLE_URL\)/);
	assert.match(rich, /bootstrapPreserved/);
	assert.match(bundle, /import\('\.\/MinimalMeadowPlayerHydration\.js'\)/);
	assert.match(bundle, /import\('\.\/MinimalMeadowFriendlyNpcs\.js'\)/);
	assert.doesNotMatch(
		rich,
		/from '\.\/MinimalMeadowFeatureBundle\.js'/
	);
});

test('B"H watchdog exposes stable timeout evidence', () => {
	const gate = source(
		'experiments/Awtsmoos/src/app/MinimalMeadowEssentialFeatureGate.js'
	);
	assert.match(gate, /MINIMAL_MEADOW_ESSENTIAL_TIMEOUT/);
	assert.match(gate, /essential-watchdog-armed/);
	assert.match(gate, /essential-watchdog-timeout/);
	assert.match(gate, /timeline: timeline\?\.snapshot/);
});

test('B"H map DOM contract remains explicit in deferred source', () => {
	const view = source(
		'experiments/Awtsmoos/src/ui/WorldMinimapView.js'
	);
	assert.match(view, /dataset\.worldMinimap = 'true'/);
	assert.match(view, /Awtsmoos-minimap/);
});

function source(relativePath) {
	return fs.readFileSync(`${GAME_ROOT}/${relativePath}`, 'utf8');
}
