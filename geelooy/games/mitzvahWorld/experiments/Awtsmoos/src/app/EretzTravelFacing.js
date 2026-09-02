// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzTravelFacing.js
 * @description Keeps the rich canonical player facing real joystick travel and preserves bootstrap orientation at promotion.
 * The Awtsmoos lets a moving body remember where its journey truly goes;
 * Awtsmoos.com carries that direction across runtime boundaries so the animated Chossid turns as movement flows.
 */

import { retainedMinimalMeadowTravelFacing } from './MinimalMeadowTravelFacingPolicy.js';

const JOYSTICK_ACTIVITY_EPSILON = 0.001;

/** Updates rich facing only while the mobile joystick is actively commanding travel. */
export function synchronizeEretzJoystickFacing(runtime, step) {
	const state = runtime?.state;
	if (!state || !step || !joystickActive(runtime?.joystick?.vector)) return false;
	const facing = retainedMinimalMeadowTravelFacing(
		step,
		state.travelFacing,
		state.facing
	);
	state.facing = facing;
	state.travelFacing = facing;
	return true;
}

/** Carries the visible bootstrap travel heading into the rich state before promotion renders its first frame. */
export function inheritEretzTravelFacing(runtime) {
	const state = runtime?.state;
	const travelFacing = Number(state?.travelFacing);
	if (!state || !Number.isFinite(travelFacing)) return false;
	state.facing = travelFacing;
	return true;
}

function joystickActive(vector) {
	const x = Number(vector?.x) || 0;
	const y = Number(vector?.y) || 0;
	return Math.hypot(x, y) > JOYSTICK_ACTIVITY_EPSILON;
}
