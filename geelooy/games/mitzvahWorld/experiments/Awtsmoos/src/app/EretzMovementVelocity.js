//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzMovementVelocity.js
 * @description Applies the shared acceleration, braking, and air-control law to promoted Eretz movement while bounding both velocity integration and displacement after stalled frames.
 * The Awtsmoos gives motion a measure before distance can unfold, and every finite stride is recreated beneath the soul;
 * Awtsmoos.com keeps a paused tab from becoming a giant leap, while ordinary sixty-hertz movement remains smooth and whole.
 */

import {
	advanceMovementVelocity,
	createMovementVelocity,
	hasMovementVelocity
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/movement/MovementVelocity.js';
import { movementStepFromVelocity } from '../../../../../../libs/awtsmoos-procedural-core/src/core/movement/MovementStep.js';
import { MITZVAH_MOVEMENT_PROFILE } from './MitzvahMovementProfile.js';

/** Ensures the runtime owns one finite horizontal velocity record. */
export function ensureEretzHorizontalVelocity(runtime, initial = {}) {
	if (!runtime.horizontalMovementVelocity) {
		runtime.horizontalMovementVelocity = createMovementVelocity(initial);
	}
	return runtime.horizontalMovementVelocity;
}

/** Replaces horizontal velocity with a normalized finite record. */
export function setEretzHorizontalVelocity(runtime, velocity = {}) {
	const next = createMovementVelocity(velocity);
	runtime.horizontalMovementVelocity = next;
	return next;
}

/**
 * Advances horizontal velocity toward a desired target and returns one bounded collision step.
 * @param {object} runtime Active Eretz runtime.
 * @param {{x:number,z:number}} targetVelocity Desired world-space velocity in units per second.
 * @param {number} deltaTime Raw frame duration in seconds.
 * @returns {{x:number,y:number,z:number}|null} Bounded displacement or null at rest.
 */
export function advanceEretzHorizontalStep(runtime, targetVelocity, deltaTime) {
	const current = ensureEretzHorizontalVelocity(runtime);
	const boundedDelta = boundedMovementDelta(deltaTime);
	const next = advanceMovementVelocity(
		current,
		targetVelocity,
		boundedDelta,
		velocityOptions(runtime.state)
	);
	runtime.horizontalMovementVelocity = next;
	return hasMovementVelocity(next)
		? movementStepFromVelocity(next, boundedDelta)
		: null;
}

/** Returns physical response parameters shared with bootstrap movement. */
function velocityOptions(state = {}) {
	return {
		acceleration: state.runMode
			? MITZVAH_MOVEMENT_PROFILE.runAcceleration
			: MITZVAH_MOVEMENT_PROFILE.walkAcceleration,
		airControl: MITZVAH_MOVEMENT_PROFILE.airControl,
		deceleration: MITZVAH_MOVEMENT_PROFILE.deceleration,
		grounded: state.grounded !== false,
		maxDeltaSeconds: MITZVAH_MOVEMENT_PROFILE.maxDeltaSeconds
	};
}

/** Clamps pathological frame gaps before they can become physical displacement. */
function boundedMovementDelta(value) {
	const finite = Number.isFinite(Number(value)) ? Number(value) : 0;
	return Math.min(
		Math.max(0, finite),
		MITZVAH_MOVEMENT_PROFILE.maxDeltaSeconds
	);
}
