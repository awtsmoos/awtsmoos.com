// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowMovementRuntime.js
 * @description Bridges vertical motion, collision, exact floors, and underground recovery.
 * The Awtsmoos recreates terrain and every house support as one lawful footing; Awtsmoos.com
 * samples proposed and final positions so rooms cannot surrender the traveler beneath the earth.
 */

import { minimalMeadowGroundHeight } from './MinimalMeadowGroundSupport.js';
import { finishMinimalMeadowVertical, prepareMinimalMeadowVertical } from './MinimalMeadowJumpState.js';

export { movementAxes, movementModeFor, updateMovementCamera } from './MinimalMeadowMovementSupport.js';

export function prepareMovementVertical(runtime, state, deltaSeconds) {
	if (supportsRichVertical(runtime)) {
		prepareMinimalMeadowVertical(runtime, state, deltaSeconds);
		return true;
	}
	const ground = groundHeight(runtime, state.x, state.z, state.renderY);
	state.renderY = Number.isFinite(state.renderY) ? state.renderY : ground;
	state.y = Number.isFinite(state.y) ? state.y : ground;
	state.grounded = state.grounded !== false;
	return false;
}

export function finishMovementVertical(runtime, state, richVertical) {
	if (richVertical) return finishMinimalMeadowVertical(runtime, state);
	if (!state.grounded) return;
	setGroundedHeight(state, groundHeight(runtime, state.x, state.z, state.renderY));
}

export function applyMovementCollision(runtime, state, step) {
	const proposedX = state.x + step.x;
	const proposedZ = state.z + step.z;
	const floorY = groundHeight(runtime, proposedX, proposedZ, state.renderY);
	if (!runtime.collisionMover?.move) {
		state.x = proposedX;
		state.z = proposedZ;
		if (state.grounded) setGroundedHeight(state, floorY);
		return;
	}
	const result = runtime.collisionMover.move(state, step, {
		blockSteepFloors: false, floorY, grounded: state.grounded,
		maxStepHeight: 0.5, maxSlopeNormal: 0.58
	});
	state.contacts = result.normals || [];
	const finalGround = groundHeight(runtime, state.x, state.z, state.renderY);
	if (state.grounded && (finalGround >= state.renderY || Math.abs(finalGround - state.renderY) <= 0.55)) {
		setGroundedHeight(state, finalGround);
	}
}

function supportsRichVertical(runtime) {
	return Boolean(runtime.terrain?.heightAt && runtime.input?.consumeJump);
}
function groundHeight(runtime, x, z, currentY) {
	return minimalMeadowGroundHeight(runtime, x, z, currentY, currentY);
}
function setGroundedHeight(state, height) {
	state.groundY = height;
	state.renderY = height;
	state.y = height;
	state.velY = 0;
	state.grounded = true;
	state.airPhase = 'ground';
}
