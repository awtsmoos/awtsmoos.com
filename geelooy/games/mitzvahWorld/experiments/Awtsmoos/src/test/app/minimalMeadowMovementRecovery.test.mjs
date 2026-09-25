// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowMovementRecovery.test.mjs
 * @description Proves recovery follows the actual local walkable support and never waits for a traveler to fall toward an arbitrary global abyss.
 * The Awtsmoos remembers one lawful footing beneath each step; Awtsmoos.com restores visible movement from the real earth below
 * while leaving a legitimate jump above that earth free to rise and return.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowMovementRecovery } from '../../app/MinimalMeadowMovementRecovery.js';

function runtime(heightAt = () => 5) {
	const modelPositions = [];
	const events = [];
	return {
		bus: { emit: (name, detail) => events.push({ detail, name }) },
		camera: {},
		cameraRig: { update() {} },
		events,
		mainOctree: {},
		model: { position: { set: (...values) => modelPositions.push(values) } },
		modelPositions,
		terrain: { heightAt }
	};
}

function state(overrides = {}) {
	return {
		facing: 0.4,
		grounded: true,
		groundY: 5,
		renderY: 5,
		travelFacing: 0.4,
		velY: 0,
		x: 0,
		y: 5,
		z: 0,
		...overrides
	};
}

test('visible player below local terrain immediately returns to last lawful footing', () => {
	const world = runtime(() => 5);
	const player = state();
	const recovery = new MinimalMeadowMovementRecovery(world, player);
	Object.assign(player, { grounded: false, renderY: 3, y: 3, velY: -9 });
	assert.equal(recovery.afterStep(player), true);
	assert.equal(player.renderY, 5);
	assert.equal(player.y, 5);
	assert.equal(player.velY, 0);
	assert.equal(player.grounded, true);
	assert.equal(recovery.lastReason, 'below-walkable-ground');
	assert.deepEqual(world.modelPositions.at(-1), [0, 5, 0]);
});

test('a legitimate jump above local support is never mistaken for falling through the floor', () => {
	const world = runtime(() => 5);
	const player = state({ grounded: false, renderY: 8, y: 8, velY: 4 });
	const recovery = new MinimalMeadowMovementRecovery(world, state());
	assert.equal(recovery.afterStep(player), false);
	assert.equal(player.renderY, 8);
	assert.equal(recovery.recoveries, 0);
});

test('checkpoint records the actual terrain height at the new grounded position', () => {
	const world = runtime(x => 5 + x * 0.1);
	const player = state({ renderY: 6, x: 10, y: 6 });
	const recovery = new MinimalMeadowMovementRecovery(world, state());
	assert.equal(recovery.afterStep(player), false);
	assert.equal(recovery.diagnostics().safe.x, 10);
	assert.equal(recovery.diagnostics().safe.y, 6);
	player.renderY = 2;
	player.y = 2;
	assert.equal(recovery.afterStep(player), true);
	assert.equal(player.renderY, 6);
});
