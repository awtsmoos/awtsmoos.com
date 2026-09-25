// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzFoundationDeferredPlayer.test.js
 * @description Proves frame and terrain are witnessed before the generated essential-player chunk crosses its deferred runtime boundary.
 * The Awtsmoos lets visible world and authored traveler remain distinct vessels whose order is truthful;
 * Awtsmoos.com keeps the heavy GLTF graph outside foundation while one prebuilt player garment arrives only after earth and light are proven.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const foundation = readFileSync(new URL('./EretzWorldFoundation.js', import.meta.url), 'utf8');
const deferred = readFileSync(new URL('./EretzDeferredEssentialAssets.js', import.meta.url), 'utf8');

test('foundation proves frame and terrain before generated player assets load', () => {
	const frame = foundation.indexOf('ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME');
	const terrain = foundation.indexOf('ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS');
	const player = foundation.indexOf('await loadDeferredEretzEssentialAssets');
	assert.ok(frame >= 0);
	assert.ok(terrain > frame);
	assert.ok(player > terrain);
});

test('foundation source has no static canonical-player loader edge', () => {
	assert.doesNotMatch(foundation, /from '\.\/EretzEssentialAssetLoader\.js'/);
	assert.doesNotMatch(foundation, /from '\.\/EretzEssentialPlayerGlb\.js'/);
	assert.match(foundation, /from '\.\/EretzDeferredEssentialAssets\.js'/);
});

test('deferred asset module imports the generated player runtime chunk', () => {
	assert.match(deferred, /resolveGeneratedRuntimeChunkUrl/);
	assert.match(deferred, /mitzvah-world-player\.compact\.js/);
	assert.match(deferred, /import\(PLAYER_CHUNK_URL\)/);
	assert.doesNotMatch(deferred, /resolveDeferredAppModuleUrl/);
	assert.doesNotMatch(deferred, /^import .*EretzEssentialAssetLoader/m);
});
