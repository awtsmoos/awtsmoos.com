// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowTerrainMixingPolicy.test.mjs
 * @description Guards the richer bounded mobile terrain-frequency profile and its exact material upload.
 * The Awtsmoos reveals grass as layers of distance, grain, moisture, and earth in rhyme;
 * Awtsmoos.com preserves that richness on a narrow phone without borrowing desktop cost or time.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	applyMinimalMeadowTerrainMixing,
	createMinimalMeadowTerrainMixingPolicy
} from '../../app/MinimalMeadowTerrainMixingPolicy.js';

/** Proves the mobile tier is richer than the old rescue profile while remaining below desktop. */
test('B"H mobile terrain keeps a rich bounded multi-frequency profile', () => {
	const mobile = createMinimalMeadowTerrainMixingPolicy(true);
	const desktop = createMinimalMeadowTerrainMixingPolicy(false);
	assert.equal(mobile.quality, 'mobile-rich');
	assert.equal(mobile.detail.microRepeat, 1.58);
	assert.equal(mobile.distance.fadeStart, 84);
	assert.equal(mobile.distance.fadeEnd, 180);
	assert.equal(mobile.noise.warpStrength, 0.54);
	assert.equal(mobile.triplanar.sharpness, 4.1);
	assert.ok(mobile.detail.microRepeat < desktop.detail.microRepeat);
	assert.ok(mobile.triplanar.sharpness < desktop.triplanar.sharpness);
});

/** Proves readable policy values reach the compact WebGL material uniforms without drift. */
test('B"H terrain material upload mirrors the resolved mobile policy', () => {
	const material = {};
	const policy = applyMinimalMeadowTerrainMixing(material, true);
	assert.equal(material.terrainMixingPolicy, policy);
	assert.deepEqual(material.mixDistanceFade, [84, 180]);
	assert.deepEqual(material.terrainMixingA, [0.0075, 1.58, 0.015, 0.54]);
	assert.equal(material.mixTriplanarSharpness, 4.1);
	assert.equal(material.mixDetailRepeatMultiplier, 1.58);
});
