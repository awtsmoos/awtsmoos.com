// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file grassPlacementEvolution.test.mjs
 * @description Protects the historic grass doorway while proving deterministic clumping, hook compatibility, ecology exclusions, and renderer-ready records.
 * The Awtsmoos renews every meadow point before old and new APIs can differ, while Awtsmoos.com asks richer fields to enter without breaking the seed;
 * these tests guard that the familiar path remains exact when advanced ecology sleeps, and becomes deeper only when callers awaken the need.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createGrassEcologyReport } from '../src/core/geometry/grass/grassEcology.js';
import { createGrassFieldMesh } from '../src/core/geometry/grass/createGrassFieldMesh.js';
import { planGrassPlacements } from '../src/core/geometry/grass/grassPlacement.js';

/**
 * Creates a compact deterministic field configuration whose habitat density accepts every valid candidate.
 * @param {object} [overrides={}] Focused caller overrides.
 * @returns {object} Grass placement options.
 */
function field(overrides = {}) {
	return {
		baseDensity: 1,
		bounds: { maxX: 4, maxZ: 4, minX: -4, minZ: -4 },
		count: 18,
		seed: 770,
		...overrides
	};
}

test('neutral clumping preserves the default placement plan exactly', () => {
	const yesodDefault = planGrassPlacements(field());
	const gevurahNeutral = planGrassPlacements(field({ clumpStrength: 0 }));
	assert.deepEqual(gevurahNeutral, yesodDefault);
});

test('grass plans remain deterministic while opt-in clumping adds stable evidence', () => {
	const options = field({ clumpScale: 2.5, clumpStrength: 0.9 });
	const first = planGrassPlacements(options);
	const second = planGrassPlacements(options);
	assert.deepEqual(first, second);
	assert.ok(first.placements.some((placement) => placement.densityMultiplier !== 1));
	for (const placement of first.placements) {
		assert.ok(placement.clumpSignal >= 0 && placement.clumpSignal <= 1);
		assert.ok(placement.densityMultiplier >= 0.2 && placement.densityMultiplier <= 1.8);
	}
});

test('candidateAt keeps the historic random-attempt-bounds signature', () => {
	const malchusBounds = { maxX: 2, maxZ: 3, minX: -2, minZ: -3 };
	let hodWitness = null;
	const plan = planGrassPlacements(field({
		bounds: malchusBounds,
		candidateAt(random, attempt, bounds) {
			hodWitness = { attempt, bounds, hasRange: typeof random.range === 'function' };
			return { x: 1, z: 2 };
		},
		count: 1,
		heightAt: () => 7
	}));
	assert.deepEqual(hodWitness, { attempt: 0, bounds: malchusBounds, hasRange: true });
	assert.deepEqual(plan.placements[0].position, { x: 1, y: 7, z: 2 });
});

test('weighted profile selection preserves all renderer-consumed placement fields', () => {
	const plan = planGrassPlacements(field({
		count: 3,
		profiles: [{ id: 'lush', maxLean: 0.2, maxScale: 1.1, minLean: 0.2, minScale: 1.1, weight: 1 }]
	}));
	for (const placement of plan.placements) {
		assert.equal(placement.profile, 'lush');
		assert.equal(placement.scale, 1.1);
		assert.equal(placement.lean, 0.2);
		for (const key of ['position', 'yaw', 'scale', 'lean', 'windPhase', 'profile', 'habitatScore']) {
			assert.ok(key in placement);
		}
	}
});

test('ecology exclusions still reject occupied ground', () => {
	const report = createGrassEcologyReport({
		baseDensity: 1,
		exclusions: [{ radius: 2, x: 0, z: 0 }],
		point: { x: 1, z: 0 }
	});
	assert.equal(report.accepted, false);
});

test('grass mesh consumes evolved placements without adapter changes', () => {
	const mesh = createGrassFieldMesh(field({ count: 5, clumpStrength: 0.7 }));
	assert.equal(mesh.instanceCount, mesh.placements.length);
	assert.equal(mesh.instanceOffsets.length, mesh.instanceCount * 3);
	assert.equal(mesh.instanceScales.length, mesh.instanceCount);
	assert.equal(mesh.instanceRotations.length, mesh.instanceCount);
	assert.equal(mesh.instanceBends.length, mesh.instanceCount);
	assert.equal(mesh.instanceWindPhases.length, mesh.instanceCount);
});
