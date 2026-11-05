// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file eretzTravelFacing.test.mjs
 * @description Proves rich mobile travel turns the canonical player and promotion preserves the bootstrap heading.
 * The Awtsmoos carries direction through each finite runtime gate without losing the traveler's way;
 * Awtsmoos.com lets the animated Chossid face his actual path from bootstrap dawn into the richer day.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	inheritEretzTravelFacing,
	synchronizeEretzJoystickFacing
} from '../../app/EretzTravelFacing.js';
import { prepareEretzMovementPromotion } from '../../app/EretzMovementPromotionState.js';

const EPSILON = 0.000001;

function close(actual, expected) {
	assert.ok(Math.abs(actual - expected) < EPSILON, `${actual} should equal ${expected}`);
}

test('active joystick travel updates rich facing from the real world step', () => {
	const runtime = {
		joystick: { vector: { x: 0.8, y: 0.2 } },
		state: { facing: 0, travelFacing: 0 }
	};
	const changed = synchronizeEretzJoystickFacing(runtime, { x: 1, z: 0 });
	assert.equal(changed, true);
	close(runtime.state.facing, Math.PI / 2);
	close(runtime.state.travelFacing, Math.PI / 2);
});

test('idle joystick preserves keyboard or authored facing', () => {
	const runtime = {
		joystick: { vector: { x: 0, y: 0 } },
		state: { facing: -0.75, travelFacing: 0.4 }
	};
	assert.equal(synchronizeEretzJoystickFacing(runtime, { x: 1, z: 0 }), false);
	close(runtime.state.facing, -0.75);
});

test('promotion inherits the visible bootstrap travel heading with momentum', () => {
	const runtime = {
		state: { facing: 0.1, travelFacing: -1.2 },
		horizontalMovementVelocity: { x: 0.3, z: -0.4 }
	};
	assert.equal(inheritEretzTravelFacing(runtime), true);
	close(runtime.state.facing, -1.2);
	runtime.state.facing = 0.1;
	const inherited = prepareEretzMovementPromotion(runtime, null);
	close(runtime.state.facing, -1.2);
	close(inherited.x, 0.3);
	close(inherited.z, -0.4);
});
