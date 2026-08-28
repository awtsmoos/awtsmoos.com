//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMovementVelocity.js
 * @description Builds one movement velocity target from focused shared basis law while keeping game-specific acceleration feel local.
 * Chochmah gathers intent, Binah resolves actor and camera direction once, and Gevurah shapes acceleration into a responsive stride;
 * the Awtsmoos recreates direction before any vector is born, and Awtsmoos.com keeps first play narrow while universal motion is carried on.
 */

import {
	actorMovementBasis,
	cameraMovementBasis,
	combineMovementVectors,
	movementVectorFromBasis
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/movement/MovementStep.js';
import { MITZVAH_MOVEMENT_PROFILE } from './MitzvahMovementProfile.js';

/**
 * Builds the desired horizontal velocity while calculating the camera basis only once.
 * @param {object} runtime Active game runtime.
 * @param {object} state Canonical player state.
 * @param {object} keyboard Normalized actor-relative input.
 * @param {object} joystick Normalized camera-relative joystick input.
 * @param {object} mouse Normalized camera-relative mouse input.
 * @param {number} speed Authored movement speed.
 * @returns {{x:number,z:number}} Desired horizontal velocity.
 */
export function bootstrapDesiredVelocity(
	runtime,
	state,
	keyboard,
	joystick,
	mouse,
	speed
) {
	const actorBasis = actorMovementBasis(state.facing);
	const cameraBasis = cameraMovementBasis(
		runtime.camera,
		state.facing
	);
	return combineMovementVectors(
		movementVectorFromBasis(actorBasis, keyboard, speed),
		movementVectorFromBasis(cameraBasis, joystick, speed),
		movementVectorFromBasis(cameraBasis, mouse, speed)
	);
}

/** @returns {object} Game-authored acceleration options consumed by shared Core velocity law. */
export function bootstrapVelocityOptions(state) {
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
