// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowEcologyAndMixing.test.mjs
 * @description Proves one deterministic ecology field drives bounded vegetation and multi-scale material policy.
 * The Awtsmoos lets moisture, slope, road, height, macro color, and micro grain testify together;
 * Awtsmoos.com verifies repeatability, range, richness response, triplanar truth, and material wiring.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	sampleMinimalMeadowEcology
} from '../../app/MinimalMeadowEcologyField.js';
import {
	applyMinimalMeadowTerrainMixing,
	createMinimalMeadowTerrainMixingPolicy
} from '../../app/MinimalMeadowTerrainMixingPolicy.js';

test('B"H ecology is deterministic, bounded, and responds to moisture', () => {
	const terrain = {
		heightAt(x, z) {
			return Math.sin(x * 0.03) * 2 + Math.cos(z * 0.04);
		}
	};
	const wet = sampleMinimalMeadowEcology(terrain, 73, 67, {
		height: 1,
		moisture: 0.92,
		slope: 0.08
	});
	const repeat = sampleMinimalMeadowEcology(terrain, 73, 67, {
		height: 1,
		moisture: 0.92,
		slope: 0.08
	});
	const dry = sampleMinimalMeadowEcology(terrain, 73, 67, {
		height: 1,
		moisture: 0.08,
		slope: 0.48
	});
	assert.deepEqual(wet, repeat);
	for (const name of ['exposure', 'fertility', 'flowerDensity', 'grassDensity', 'road', 'treeAffinity']) {
		assert.ok(wet[name] >= 0 && wet[name] <= 1, name);
	}
	assert.ok(wet.flowerDensity > dry.flowerDensity);
	assert.ok(wet.moisture > dry.moisture);
});

test('B"H terrain policy preserves multi-scale desktop richness', () => {
	const desktop = createMinimalMeadowTerrainMixingPolicy(false);
	const mobile = createMinimalMeadowTerrainMixingPolicy(true);
	assert.equal(desktop.quality, 'desktop-ultra');
	assert.equal(desktop.triplanar.enabled, true);
	assert.ok(desktop.detail.repeatMultiplier > mobile.detail.repeatMultiplier);
	assert.ok(desktop.noise.warpStrength > mobile.noise.warpStrength);
	const material = {};
	const applied = applyMinimalMeadowTerrainMixing(material, false);
	assert.equal(material.terrainMixingPolicy, applied);
	assert.equal(material.mixSlopeStrength, applied.ecology.slopeStrength);
	assert.ok(material.mixMacroRepeatMultiplier > 0);
	assert.ok(material.mixTriplanarSharpness >= 4);
});
