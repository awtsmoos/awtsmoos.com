// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowNativeBootContract.test.mjs
 * @description Locks production boot to one eager ESM doorway and conditional optional entries.
 * The Awtsmoos opens the playable module graph without unopened tools; Awtsmoos.com verifies
 * launcher, scheduler, runtime, feature bundle, mobile care, and API exploration remain explicit.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const gameRoot = 'geelooy/games/mitzvahWorld';
const revision = '20260728-full-wave-1';

test('B"H production index eagerly loads only the shared meadow launcher', () => {
	const index = source('index.html');
	const scripts = [...index.matchAll(/<script type="module"[^>]+src="([^"]+)"/g)]
		.map(match => match[1]);
	assert.equal(scripts.length, 1);
	assert.match(scripts[0], /MinimalSharedMeadowPage\.js/);
	assert.match(scripts[0], new RegExp(`rev=${revision}`));
	assert.doesNotMatch(index, /MinimalMeadowMobileIntegration\.js/);
	assert.doesNotMatch(index, /MinimalUniversalApiExplorer\.js/);
	assert.doesNotMatch(index, /mitzvah-world-mobile-integration\.css/);
	assert.doesNotMatch(index, /mitzvah-world-api-explorer\.css/);
	assert.match(index, /MinimalMeadowTreeCoreFacade\.js/);
});

test('B"H launcher conditionally owns mobile and API entry points', () => {
	const launcher = source('experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js');
	const optional = source('experiments/Awtsmoos/src/launcher/MinimalMeadowOptionalEntries.js');
	assert.match(launcher, /installMinimalMeadowOptionalEntries/);
	assert.match(optional, /MinimalMeadowMobileIntegration\.js\?rev=20260728-full-wave-1/);
	assert.match(optional, /MinimalUniversalApiExplorer\.js\?rev=20260728-universal-api-1/);
	assert.match(optional, /AwtsmoosOpenApiExplorer/);
});

test('B"H launcher, runtime, and feature bundle share one fresh dependency boundary', () => {
	const launcher = source('experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js');
	const runtime = source('experiments/Awtsmoos/src/app/createMinimalMeadowRuntime.js');
	const bundle = source('experiments/Awtsmoos/src/app/MinimalMeadowFeatureBundle.js');
	assert.match(launcher, new RegExp(`createMinimalMeadowRuntime\\.js\\?rev=${revision}`));
	assert.match(runtime, new RegExp(`FEATURE_REVISION = '${revision}'`));
	assert.match(runtime, /scheduleMinimalMeadowFeatures/);
	assert.match(runtime, /MinimalMeadowFeatureBundle\.js\?compact=true&rev=/);
	assert.match(bundle, new RegExp(`MinimalMeadowUi\\.js\\?rev=${revision}`));
	assert.match(bundle, new RegExp(`MinimalMeadowWorldSystems\\.js\\?rev=${revision}`));
});

test('B"H native facade is served as an explicit-binding module contract', () => {
	const facade = source('experiments/Awtsmoos/src/app/MinimalMeadowTreeCoreFacade.js');
	assert.match(facade, /import\s*\{/);
	assert.match(facade, /export function generateTreeProceduralData/);
	assert.doesNotMatch(facade, /export\s*\{[\s\S]*?\}\s*from/);
});

function source(relativePath) {
	return fs.readFileSync(`${gameRoot}/${relativePath}`, 'utf8');
}
