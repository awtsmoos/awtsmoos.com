// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file terrainBootPolicy.test.mjs
 * @description Proves movement-ready terrain is bounded while full refinement remains available.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import {
	createTerrainBootPolicy,
	MOVEMENT_READY_TERRAIN_STEPS,
	REFINED_TERRAIN_STEPS
} from '../../world/TerrainBootPolicy.js';

test('default boot terrain is bounded below canonical refinement density', () => {
	const policy = createTerrainBootPolicy();
	assert.equal(policy.movementSteps, 64);
	assert.equal(policy.refinementSteps, 128);
	assert.equal(policy.movementSteps, MOVEMENT_READY_TERRAIN_STEPS);
	assert.equal(policy.refinementSteps, REFINED_TERRAIN_STEPS);
	assert.ok(policy.movementSteps < policy.refinementSteps);
	assert.equal(Object.isFrozen(policy), true);
});

test('diagnostic overrides stay bounded and refinement never undercuts movement', () => {
	assert.deepEqual(
		createTerrainBootPolicy({ movementSteps: 8, refinementSteps: 32 }),
		{ movementSteps: 24, refinementSteps: 32 }
	);
	assert.deepEqual(
		createTerrainBootPolicy({ movementSteps: 90, refinementSteps: 40 }),
		{ movementSteps: 64, refinementSteps: 64 }
	);
	assert.deepEqual(
		createTerrainBootPolicy({ movementSteps: 48.4, refinementSteps: 150 }),
		{ movementSteps: 48, refinementSteps: 128 }
	);
});
