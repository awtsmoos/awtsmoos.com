// B"H
// Boruch Hashem
// Blessed is He

/** @file minimalMeadowNativeBootContract.test.mjs @description Locks compact production entry and deferred optional graph. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
const gameRoot = 'geelooy/games/mitzvahWorld';
test('B"H production index eagerly loads only the compact entry', () => {
	const index = source('index.html');
	const scripts = [...index.matchAll(/<script type="module"[^>]+src="([^"]+)"/g)].map(match => match[1]);
	assert.equal(scripts.length, 1);
	assert.match(scripts[0], /mitzvah-world\.compact\.js/);
	assert.doesNotMatch(index, /MinimalMeadowMobileIntegration\.js/);
	assert.doesNotMatch(index, /MinimalUniversalApiExplorer\.js/);
	assert.doesNotMatch(index, /mitzvah-world-mobile-integration\.css/);
	assert.doesNotMatch(index, /mitzvah-world-api-explorer\.css/);
});
test('B"H launcher conditionally owns mobile and API entries', () => {
	const launcher = source('experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js');
	const optional = source('experiments/Awtsmoos/src/launcher/MinimalMeadowOptionalEntries.js');
	assert.match(launcher, /installMinimalMeadowOptionalEntries/);
	assert.match(optional, /MinimalMeadowMobileIntegration\.js/);
	assert.match(optional, /MinimalUniversalApiExplorer\.js/);
	assert.match(optional, /AwtsmoosOpenApiExplorer/);
});
test('B"H runtime schedules one deferred feature-bundle boundary', () => {
	const launcher = source('experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js');
	const runtime = source('experiments/Awtsmoos/src/app/createMinimalMeadowRuntime.js');
	const scheduler = source('experiments/Awtsmoos/src/app/MinimalMeadowFeatureScheduler.js');
	const bundle = source('experiments/Awtsmoos/src/app/MinimalMeadowFeatureBundle.js');
	assert.match(launcher, /createMinimalMeadowRuntime\.js\?rev=20260729-core/);
	assert.match(runtime, /scheduleMinimalMeadowFeatures/);
	assert.match(scheduler, /MinimalMeadowFeatureBundle\.js/);
	assert.match(scheduler, /afterFirstFrame/);
	assert.match(bundle, /MinimalMeadowUi\.js/);
	assert.match(bundle, /MinimalMeadowWorldSystems\.js/);
});
test('B"H native facade remains explicit-binding module contract', () => {
	const facade = source('experiments/Awtsmoos/src/app/MinimalMeadowTreeCoreFacade.js');
	assert.match(facade, /import\s*\{/);
	assert.match(facade, /export function generateTreeProceduralData/);
	assert.doesNotMatch(facade, /export\s*\{[\s\S]*?\}\s*from/);
});
function source(relativePath) { return fs.readFileSync(`${gameRoot}/${relativePath}`, 'utf8'); }
