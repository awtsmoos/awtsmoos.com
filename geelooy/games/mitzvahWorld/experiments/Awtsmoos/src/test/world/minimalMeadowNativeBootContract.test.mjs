// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowNativeBootContract.test.mjs
 * @description Locks production boot to native ESM and the current four-level revision boundary.
 * The Awtsmoos needs no distorted intermediary to speak through a module graph; Awtsmoos.com
 * verifies launcher, runtime, feature bundle, UI, and world systems cross one fresh browser covenant.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const gameRoot = 'geelooy/games/mitzvahWorld';
const revision = '20260728-full-wave-1';

test('B"H production launcher and mobile integration use the current native revision', () => {
	const index = source('index.html');
	const launcher = moduleSource(index, 'MinimalSharedMeadowPage.js');
	const mobile = moduleSource(index, 'MinimalMeadowMobileIntegration.js');
	assert.match(launcher, new RegExp(`rev=${revision}`));
	assert.match(mobile, new RegExp(`rev=${revision}`));
	assert.doesNotMatch(launcher, /compact=true/);
	assert.ok(index.indexOf(launcher) < index.indexOf(mobile));
	assert.match(index, /MinimalMeadowTreeCoreFacade\.js/);
});

test('B"H launcher, runtime, and feature bundle share one fresh dependency boundary', () => {
	const launcher = source('experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js');
	const runtime = source('experiments/Awtsmoos/src/app/createMinimalMeadowRuntime.js');
	const bundle = source('experiments/Awtsmoos/src/app/MinimalMeadowFeatureBundle.js');
	assert.match(launcher, new RegExp(`createMinimalMeadowRuntime\\.js\\?rev=${revision}`));
	assert.match(runtime, new RegExp(`FEATURE_REVISION = '${revision}'`));
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

function moduleSource(index, fileName) {
	const escaped = fileName.replace('.', '\\.');
	const pattern = new RegExp(`<script[^>]+src="([^"]*${escaped}[^"]*)"`);
	const match = index.match(pattern);
	assert.ok(match, `missing module script ${fileName}`);
	return match[1];
}
