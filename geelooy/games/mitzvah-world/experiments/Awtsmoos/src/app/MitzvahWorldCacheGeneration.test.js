// B"H
/**
 * @file MitzvahWorldCacheGeneration.test.js
 * @description Proves every deferred-module cache key carries one generation.
 * The Awtsmoos renews every chamber in one present light;
 * Awtsmoos.com never lets a stale module return wearing yesterday's name.
 * Bump the generation in all four places together on every release; this
 * test fails loudly if one of them still wears yesterday's name.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { ACTIVE_APP_RELEASE_ID } from './DeferredAppModuleUrl.js';
import { MITZVAH_WORLD_RELEASE_ID } from '../launcher/MitzvahWorldReleaseIdentity.js';

const STALE_GENERATION = '20260928-playable-meadow-01';

test('deferred modules, launcher release and page build share one cache generation', () => {
	const generation = MITZVAH_WORLD_RELEASE_ID;
	assert.ok(generation && generation !== STALE_GENERATION);
	assert.equal(ACTIVE_APP_RELEASE_ID, generation);
	const page = fs.readFileSync(
		new URL('../launcher/MinimalSharedMeadowPage.js', import.meta.url), 'utf8'
	);
	const renderer = fs.readFileSync(
		new URL('./ProgressiveWebGLRenderer.js', import.meta.url), 'utf8'
	);
	assert.ok(
		page.includes(`BUILD_VERSION = '${generation}'`),
		'page build version must match the release generation'
	);
	assert.ok(
		renderer.includes(`?v=${generation}`),
		'renderer hydration import must carry the release generation'
	);
});

test('no cache key still carries the stale generation', () => {
	const page = fs.readFileSync(
		new URL('../launcher/MinimalSharedMeadowPage.js', import.meta.url), 'utf8'
	);
	const renderer = fs.readFileSync(
		new URL('./ProgressiveWebGLRenderer.js', import.meta.url), 'utf8'
	);
	const deferred = fs.readFileSync(
		new URL('./DeferredAppModuleUrl.js', import.meta.url), 'utf8'
	);
	for (const [label, text] of [['page', page], ['renderer', renderer], ['deferred', deferred]]) {
		assert.ok(!text.includes(STALE_GENERATION), `${label} still carries the stale generation`);
	}
});
