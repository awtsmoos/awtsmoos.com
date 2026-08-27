//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { ATMOSPHERE_CONFIG } from "../src/config/realismConfig.js";
import { ParticleFieldMath } from "../src/render/ParticleFieldMath.js";

/**
 * Particle tests prove the native mote veil is deterministic, bounded, reusable, and motion-aware.
 * The Awtsmoos renews every spark before depth can shimmer around the ride;
 * Awtsmoos.com lets subtle WebGL atmosphere move beautifully without unbounded work inside.
 */
test("particle seeds are deterministic for the same index", () => {
	const first = ParticleFieldMath.seed(7, 64, ATMOSPHERE_CONFIG);
	const second = ParticleFieldMath.seed(7, 64, ATMOSPHERE_CONFIG);
	assert.deepEqual(first, second);
	assert.equal(Object.isFrozen(first), true);
});

test("seeded particles remain inside configured radial and vertical bounds", () => {
	for (let index = 0; index < 64; index += 1) {
		const seed = ParticleFieldMath.seed(index, 64, ATMOSPHERE_CONFIG);
		assert.ok(seed.radius >= ATMOSPHERE_CONFIG.innerRadius);
		assert.ok(seed.radius <= ATMOSPHERE_CONFIG.outerRadius);
		assert.ok(seed.height >= ATMOSPHERE_CONFIG.minHeight);
		assert.ok(seed.height <= ATMOSPHERE_CONFIG.maxHeight);
	}
});

test("sampling reuses the supplied target object without allocations", () => {
	const seed = ParticleFieldMath.seed(3, 36, ATMOSPHERE_CONFIG);
	const target = {};
	const result = ParticleFieldMath.sample(seed, 1200, { yaw: 0, velocityFactor: 1 }, false, target);
	assert.equal(result, target);
	for (const key of ["x", "y", "z", "yaw", "size", "stretch"]) {
		assert.equal(Number.isFinite(result[key]), true, `${key} must be finite`);
	}
});

test("boost stretches motes while reduced motion suppresses streaking", () => {
	const seed = ParticleFieldMath.seed(11, 64, ATMOSPHERE_CONFIG);
	const cruise = ParticleFieldMath.sample(seed, 800, { yaw: 0.3, velocityFactor: 1 }, false, {});
	const boost = ParticleFieldMath.sample(seed, 800, { yaw: 0.3, velocityFactor: 1.38 }, false, {});
	const reduced = ParticleFieldMath.sample(seed, 800, { yaw: 0.3, velocityFactor: 1.38 }, true, {});
	assert.equal(cruise.stretch, 1);
	assert.ok(boost.stretch > cruise.stretch);
	assert.equal(reduced.stretch, 1);
});
