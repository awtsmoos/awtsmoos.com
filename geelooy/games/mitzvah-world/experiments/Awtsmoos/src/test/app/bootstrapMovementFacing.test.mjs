// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapMovementFacing.test.mjs
 * @description Reproduces the public same-frame facing overwrite and proves locked facing remains protected.
 * The Awtsmoos joins the travel heading to the canonical state before presentation reaches the model shore;
 * Awtsmoos.com keeps one truthful direction through movement and animation, so the visible Chossid is not turned back anymore.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { settleBootstrapMovementFacing } from '../../app/BootstrapMovementFacing.js';
import { placePlayerModel } from '../../app/EretzPlayerModel.js';

const EPSILON = 0.000001;

/** Asserts two finite angles or quaternion components share one measured value. */
function close(actual, expected) {
	assert.ok(
		Math.abs(actual - expected) < EPSILON,
		`${actual} should equal ${expected}`
	);
}

/** Creates the minimal canonical placement vessel used by EretzPlayerModel. */
function modelVessel() {
	const model = {
		position: {
			set(x, y, z) {
				model.positionValue = { x, y, z };
			}
		},
		quaternion: {
			set(x, y, z, w) {
				model.quaternionValue = { x, y, z, w };
			}
		}
	};
	return model;
}

/** Builds the canonical state shape consumed by both bootstrap movement and player placement. */
function playerState(facing = 0) {
	return {
		action: 'idle',
		facing,
		grounded: true,
		moving: false,
		renderY: 2,
		travelFacing: facing,
		x: 4,
		y: 2,
		z: 7
	};
}

test('bootstrap travel facing survives later canonical player presentation', () => {
	const runtime = {
		cameraRig: {
			locksPlayerFacing: () => false
		}
	};
	const state = playerState(0);
	const keyboard = { forward: 0, strafe: 0 };
	const receipt = settleBootstrapMovementFacing(
		runtime,
		state,
		keyboard,
		{ x: 1, z: 0 }
	);
	close(receipt.travelFacing, Math.PI / 2);
	close(state.travelFacing, Math.PI / 2);
	close(state.facing, Math.PI / 2);
	assert.equal(state.moving, true);

	const model = modelVessel();
	placePlayerModel(model, state);
	close(model.quaternionValue.y, Math.sin(Math.PI / 4));
	close(model.quaternionValue.w, Math.cos(Math.PI / 4));
	assert.deepEqual(model.positionValue, { x: 4, y: 2, z: 7 });
});

test('camera or pure-strafe facing lock preserves the authoritative heading', () => {
	const runtime = {
		cameraRig: {
			locksPlayerFacing: () => true
		}
	};
	const state = playerState(0.65);
	const receipt = settleBootstrapMovementFacing(
		runtime,
		state,
		{ forward: 0, strafe: 0 },
		{ x: 1, z: 0 }
	);
	assert.equal(receipt.locked, true);
	close(state.facing, 0.65);
	close(state.travelFacing, 0.65);
});
