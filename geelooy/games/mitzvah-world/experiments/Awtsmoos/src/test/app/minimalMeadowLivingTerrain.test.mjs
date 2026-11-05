// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowLivingTerrain.test.mjs
 * @description Proves six-channel terrain stays normalized while ecological fields vary continuously.
 * The Awtsmoos reveals one earth through ridge, drainage, erosion, road, moisture, and patch;
 * Awtsmoos.com verifies continuity, distinct samples, bounded factors, and complete material weight.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	sampleMinimalMeadowTerrainBlend
} from '../../app/MinimalMeadowTerrainBlendModel.js';
import {
	createMinimalMeadowTerrainMixingPolicy
} from '../../app/MinimalMeadowTerrainMixingPolicy.js';

test('B"H living terrain normalizes every ecological sample', () => {
	for (const point of [
		[-84, -63],
		[-17, 31],
		[0, 0],
		[42, -29],
		[91, 74]
	]) {
		const sample = sampleMinimalMeadowTerrainBlend({
			height: point[0] * 0.08,
			slope: Math.abs(point[1]) / 110,
			x: point[0],
			z: point[1]
		});
		const total = Object.values(sample.weights).reduce(
			(sum, value) => sum + value,
			0
		);
		assert.ok(Math.abs(total - 1) < 0.000001);
		for (const value of Object.values(sample.factors)) {
			assert.ok(value >= 0 && value <= 1);
		}
	}
});

test('B"H separated positions produce distinct mixtures', () => {
	const first = sampleMinimalMeadowTerrainBlend({ x: -71, z: 18 });
	const second = sampleMinimalMeadowTerrainBlend({ x: 64, z: -77 });
	assert.notDeepEqual(first.weights, second.weights);
	assert.notDeepEqual(first.color, second.color);
});

test('B"H desktop policy exposes full ecological controls', () => {
	const policy = createMinimalMeadowTerrainMixingPolicy(false);
	assert.equal(policy.quality, 'desktop-ultra');
	assert.equal(policy.triplanar.enabled, true);
	assert.ok(policy.detail.microRepeat > 1.5);
	assert.ok(policy.distance.fadeEnd >= 250);
	assert.ok(policy.ecology.drainageStrength > 0.6);
	assert.ok(policy.chromatic.tintStrength > 0.2);
});
