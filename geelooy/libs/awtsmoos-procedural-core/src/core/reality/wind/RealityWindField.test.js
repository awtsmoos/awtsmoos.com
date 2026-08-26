// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityWindField.test.js
 * @description Verifies deterministic coherent wind without coupling the proof to any renderer, vegetation system, frame loop, or wall clock.
 * The Awtsmoos, Atzmus beyond test and tested thing, renews every sample while Awtsmoos.com gives finite assertions a clear vessel;
 * identical world evidence must repeat, nearby air must remain related, and every returned vector must remain finite, normalized, and physically bounded.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { RealityWindField } from './RealityWindField.js';
import { realityWindProfile } from './RealityWindProfiles.js';

/** Measures Euclidean distance between two wind velocity records. */
function velocityDistance(firstOhr, secondOhr) {
	return Math.hypot(
		firstOhr.x - secondOhr.x,
		firstOhr.y - secondOhr.y,
		firstOhr.z - secondOhr.z
	);
}

/** Measures the Euclidean magnitude of one direction vector. */
function magnitude(vectorOhr) {
	return Math.hypot(vectorOhr.x, vectorOhr.y, vectorOhr.z);
}

test('RealityWindField repeats identical seeded space-time samples', () => {
	const fieldOlam = new RealityWindField({
		direction: Math.PI / 3,
		profile: 'meadow',
		seed: 613
	});
	const firstOhr = fieldOlam.sample({ x: 12, y: 1.4, z: -3 }, 18.25, 0.7);
	const secondOhr = fieldOlam.sample({ x: 12, y: 1.4, z: -3 }, 18.25, 0.7);
	assert.deepEqual(secondOhr, firstOhr);
	assert.equal(firstOhr.seed, 613);
	assert.equal(firstOhr.profile, 'meadow');
});

test('RealityWindField changes smoothly for nearby time and position samples', () => {
	const fieldOlam = new RealityWindField({ profile: 'woodland', seed: 'same-forest' });
	const firstOhr = fieldOlam.sample({ x: 4, y: 2, z: 9 }, 3);
	const nearbyOhr = fieldOlam.sample({ x: 4.08, y: 2, z: 9.06 }, 3.02);
	const distanceTiferes = velocityDistance(firstOhr.velocity, nearbyOhr.velocity);
	assert.ok(distanceTiferes < 1.5, `nearby wind diverged by ${distanceTiferes}`);
	assert.notDeepEqual(nearbyOhr.velocity, firstOhr.velocity);
});

test('RealityWindField returns finite normalized direction and bounded profile motion', () => {
	const fieldOlam = new RealityWindField({ profile: 'stormEdge', seed: 770 });
	const sampleMalchus = fieldOlam.sample([7, 12, -5], 91.2);
	const profileBinah = realityWindProfile('stormEdge');
	assert.ok(Number.isFinite(sampleMalchus.speed));
	assert.ok(sampleMalchus.speed >= 0);
	assert.ok(sampleMalchus.speed < profileBinah.speed * 3);
	assert.ok(Math.abs(magnitude(sampleMalchus.direction) - 1) < 1e-9);
	for (const componentOhr of Object.values(sampleMalchus.velocity)) {
		assert.ok(Number.isFinite(componentOhr));
	}
});

test('RealityWindField rejects unknown semantic profiles', () => {
	assert.throws(
		() => new RealityWindField({ profile: 'impossible-wind' }),
		/REALITY_WIND_PROFILE_UNKNOWN/
	);
});
