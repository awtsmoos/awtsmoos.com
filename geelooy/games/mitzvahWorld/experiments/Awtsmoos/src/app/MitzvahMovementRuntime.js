//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahMovementRuntime.js
 * @description Bridges shared movement law to Mitzvah terrain, collision, checkpoints, camera, and recovery through focused kinematic authority.
 * The Awtsmoos recreates every floor beneath the traveler while shared law and world policy remain distinct;
 * Awtsmoos.com keeps this adapter small so collision truth stays local and first play awakens only the motion law it has picked.
 */

import { landVerticalMotion } from '../../../../../../libs/awtsmoos-procedural-core/src/core/movement/VerticalKinematics.js';
import { minimalMeadowGroundHeight } from './MinimalMeadowGroundSupport.js';
import { finishMitzvahVertical, prepareMitzvahVertical } from './MitzvahJumpPolicy.js';

export { movementAxes, movementModeFor, updateMovementCamera } from './MitzvahMovementSupport.js';

export function prepareMovementVertical(runtime, state, deltaSeconds) {
	runtime.movementRecovery?.beforeStep(state);
	if (supportsRichVertical(runtime)) {
		prepareMitzvahVertical(runtime, state, deltaSeconds);
		return true;
	}
	const ground = groundHeight(runtime, state.x, state.z, state.renderY);
	state.renderY = Number.isFinite(state.renderY) ? state.renderY : ground;
	state.y = Number.isFinite(state.y) ? state.y : ground;
	state.grounded = state.grounded !== false;
	return false;
}

export function finishMovementVertical(runtime, state, richVertical) {
	if (richVertical) {
		finishMitzvahVertical(runtime, state);
	} else if (state.grounded) {
		landVerticalMotion(state, groundHeight(runtime, state.x, state.z, state.renderY));
	}
	runtime.movementRecovery?.afterStep(state);
}

export function applyMovementCollision(runtime, state, step) {
	const proposedX = state.x + step.x;
	const proposedZ = state.z + step.z;
	const floorY = groundHeight(runtime, proposedX, proposedZ, state.renderY);
	if (!runtime.collisionMover?.move) {
		state.x = proposedX;
		state.z = proposedZ;
		if (state.grounded) landVerticalMotion(state, floorY);
		return;
	}
	const result = runtime.collisionMover.move(state, step, {
		blockSteepFloors: false,
		floorY,
		grounded: state.grounded,
		maxSlopeNormal: 0.58,
		maxStepHeight: 0.5
	});
	state.contacts = result.normals || [];
	const finalGround = groundHeight(runtime, state.x, state.z, state.renderY);
	if (state.grounded && (finalGround >= state.renderY || Math.abs(finalGround - state.renderY) <= 0.55)) {
		landVerticalMotion(state, finalGround);
	}
}

function supportsRichVertical(runtime) {
	return Boolean(runtime.terrain?.heightAt && runtime.input?.consumeJump);
}

function groundHeight(runtime, x, z, currentY) {
	return minimalMeadowGroundHeight(runtime, x, z, currentY, currentY);
}
