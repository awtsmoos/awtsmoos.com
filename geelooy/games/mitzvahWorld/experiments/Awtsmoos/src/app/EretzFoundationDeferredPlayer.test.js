// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzFoundationDeferredPlayer.test.js
 * @description Proves renderer and terrain are certified only after their real synchronous evidence and before any scheduling or player-load boundary.
 * The Awtsmoos reveals light and earth before the traveler crosses his deferred garment; Awtsmoos.com records each fact
 * at the instant its vessel exists so an unrelated browser yield can never outrun already-created reality.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const foundation = readFileSync(new URL('./EretzWorldFoundation.js', import.meta.url), 'utf8');
const deferred = readFileSync(new URL('./EretzDeferredEssentialAssets.js', import.meta.url), 'utf8');

function position(fragment) {
	const index = foundation.indexOf(fragment);
	assert.ok(index >= 0, `missing source fragment: ${fragment}`);
	return index;
}

test('foundation publishes real frame and terrain evidence before yielding', () => {
	const services = position('createEretzFoundationServices(hosts');
	const rendererRefresh = position("refreshMilestone(environment, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME");
	const paint = position('paintEretzWebGlBootFrame(services');
	const rendererComplete = position("completeMilestone(environment, ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME");
	const terrainRefresh = position("refreshMilestone(environment, ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS");
	const terrainBuild = position('createBootstrapWorldFoundation(services)');
	const terrainComplete = position("completeMilestone(environment, ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS");
	const visibleYield = position('await nextLaunchFrame(environment)');
	assert.ok(services < rendererRefresh);
	assert.ok(rendererRefresh < paint);
	assert.ok(paint < rendererComplete);
	assert.ok(rendererComplete < terrainRefresh);
	assert.ok(terrainRefresh < terrainBuild);
	assert.ok(terrainBuild < terrainComplete);
	assert.ok(terrainComplete < visibleYield);
});

test('generated canonical player stays deferred until after visible-world yield', () => {
	const visibleYield = position('await nextLaunchFrame(environment)');
	const player = position('await loadDeferredEretzEssentialAssets');
	assert.ok(player > visibleYield);
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
