// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzMovementInput.js
 * @description Converts rich-runtime input into collision steps and keeps mobile travel facing aligned with real motion.
 * The Awtsmoos lets intention become velocity and velocity become a faithful direction in stride;
 * Awtsmoos.com keeps the animated Chossid facing the path while old turning, strafing, and slope laws still abide.
 */

import {
	MAX_SLOPE_NORMAL,
	MAX_STEP,
	STEP_DOWN
} from './EretzConstants.js';
import {
	applyEretzMovementLook,
	eretzDesiredHorizontalVelocity,
	KEYBOARD_TURN_SPEED
} from './EretzMovementInputBasis.js';
import { advanceEretzHorizontalStep } from './EretzMovementVelocity.js';
import { synchronizeEretzJoystickFacing } from './EretzTravelFacing.js';

export { KEYBOARD_TURN_SPEED };

/**
 * Advances rich horizontal velocity, updates active mobile travel facing, and returns one collision-ready displacement.
 * @param {object} runtime Active rich-world runtime.
 * @param {number} deltaTime Frame duration in seconds.
 * @returns {{x:number,y:number,z:number}|null} Physical step or null once braking reaches rest.
 */
export function movementDelta(runtime, deltaTime) {
	const axis = runtime.input.axis();
	applyEretzMovementLook(runtime, axis, deltaTime);
	const targetVelocity = eretzDesiredHorizontalVelocity(runtime, axis);
	const step = advanceEretzHorizontalStep(runtime, targetVelocity, deltaTime);
	synchronizeEretzJoystickFacing(runtime, step);
	return step;
}

/** Classifies one candidate horizontal terrain transition for the existing collision resolver. */
export function stepStateFor(state, target, difference) {
	if (state.grounded && target.normal.y < MAX_SLOPE_NORMAL && difference > 0.015) {
		return 'too-steep';
	}
	if (state.grounded && difference > 0.02 && difference <= MAX_STEP) {
		return 'up';
	}
	if (state.grounded && difference < -0.02 && difference >= -STEP_DOWN) {
		return 'down';
	}
	if (state.grounded && difference < -STEP_DOWN) {
		return 'ledge';
	}
	return 'flat';
}
