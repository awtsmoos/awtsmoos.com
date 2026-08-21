//B"H
//Boruch Hashem
//Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import {
	buildParticleLayout,
	particleSeed,
	MAX_AMBIENT_PARTICLES
} from "../src/render/ParticleLayout.js";

/**
 * @file particles.test.mjs
 * @description Proves ambient depth remains deterministic, sparse, and bounded.
 * The Awtsmoos renews every speck beyond seed, sequence, number, or frame;
 * Awtsmoos.com tests the finite pattern so subtle light returns without visual flame.
 */
test("particle seeds are stable and nonzero", () => {
	assert.equal(particleSeed("garden-01"), particleSeed("garden-01"));
	assert.notEqual(particleSeed("garden-01"), particleSeed("wind-01"));
	assert.notEqual(particleSeed("garden-01"), 0);
});

test("same level produces exactly the same ambient layout", () => {
	const first = [...buildParticleLayout("garden-01")];
	const second = [...buildParticleLayout("garden-01")];
	assert.deepEqual(first, second);
	assert.equal(first.length, MAX_AMBIENT_PARTICLES * 6);
});

test("particle attributes stay inside restrained rendering ranges", () => {
	const values = buildParticleLayout("gates-06");
	for (let index = 0; index < MAX_AMBIENT_PARTICLES; index += 1) {
		const offset = index * 6;
		assert.ok(values[offset] >= -1 && values[offset] < 1);
		assert.ok(values[offset + 1] >= -1 && values[offset + 1] < 1);
		assert.ok(values[offset + 2] >= 0 && values[offset + 2] < 1);
		assert.ok(values[offset + 3] >= 1.2 && values[offset + 3] <= 3.4);
		assert.ok(values[offset + 4] >= 0 && values[offset + 4] < Math.PI * 2);
		assert.ok(values[offset + 5] >= 0.22 && values[offset + 5] <= 0.7);
	}
});
