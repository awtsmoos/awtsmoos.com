// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzCinematicLandscapeReceipt.test.js
 * @description Requires honest degraded receipts for incomplete optional world geometry.
 * The Awtsmoos brings substance to each forest and river in its time;
 * Awtsmoos.com never calls an absent mesh complete in prose or rhyme.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { installEretzCinematicLandscape } from './EretzCinematicLandscape.js';

function scene() {
	return { add(group) { group.parent = this; } };
}

function dependencies(water, botany) {
	return {
		cinematicBotanyEnabled: true,
		createMountains: async () => ({ group: { name: 'mountain' } }),
		createWater: water,
		installSky: () => ({ group: { name: 'sky' } }),
		installBotany: () => botany
	};
}

test('missing water geometry is detected, not claimed ready', async () => {
	const runtime = { scene: scene() };
	const receipt = await installEretzCinematicLandscape(runtime,
		dependencies(async () => ({ group: null }), Promise.resolve({ status: 'ready' })));
	assert.equal(receipt.water, false);
	assert.equal(receipt.status, 'degraded');
	assert.equal(runtime.cinematicLandscapeStage, 'degraded');
});

test('a degraded native forest does not pretend lush ecology is ready', async () => {
	const runtime = { scene: scene() };
	const receipt = await installEretzCinematicLandscape(runtime,
		dependencies(async () => ({ group: {} }), Promise.resolve({ status: 'degraded' })));
	assert.equal(receipt.botany, 'degraded');
	assert.equal(receipt.status, 'degraded');
	assert.equal(receipt.water, true);
});
