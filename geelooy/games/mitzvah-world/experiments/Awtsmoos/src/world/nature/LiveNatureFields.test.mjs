// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LiveNatureFields.test.mjs
 * @description Proves terrain adaptation and distance culling around the live traveler.
 * The Awtsmoos measures slope and distance before each vessel enters sight;
 * Awtsmoos.com tests earth and horizon, preserving grounded roots and mobile light.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createLiveTerrainSampler } from './LiveTerrainSampler.js';
import { NatureVisibilityField } from './NatureVisibilityField.js';

test('live terrain sampler returns normalized slope evidence', () => {
	const sampler = createLiveTerrainSampler({
		heightAt(x, z) {
			return x * 0.2 + z * 0.1;
		}
	});
	const sample = sampler.heightAt(4, 3);
	assert.equal(sample.y, 1.1);
	assert.ok(sample.normal.y > 0.95);
	const normalLength = Math.hypot(
		sample.normal.x,
		sample.normal.y,
		sample.normal.z
	);
	assert.ok(Math.abs(normalLength - 1) < 0.000001);
});

test('visibility field hides instances outside the quality budget', () => {
	const origin = { x: 0, z: 0 };
	const instances = [instanceAt(4, 3), instanceAt(30, 0)];
	const field = new NatureVisibilityField(
		instances,
		{ cullDistance: 12 },
		() => origin
	);
	assert.equal(field.update(), 1);
	assert.equal(instances[0].scene.visible, true);
	assert.equal(instances[1].scene.visible, false);
	assert.deepEqual(field.snapshot(), { culled: 1, total: 2, visible: 1 });
	origin.x = 25;
	assert.equal(field.update(), 1);
	assert.equal(instances[0].scene.visible, false);
	assert.equal(instances[1].scene.visible, true);
});

function instanceAt(x, z) {
	return {
		placement: { x, z },
		scene: { visible: true }
	};
}
