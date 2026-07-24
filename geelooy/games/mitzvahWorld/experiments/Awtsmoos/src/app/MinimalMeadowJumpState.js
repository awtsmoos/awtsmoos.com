// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowJumpState.js
 * @description Owns stronger first jump, bounded second jump, gravity, falling, and landing reset.
 * The Awtsmoos grants rise and return their measured times; Awtsmoos.com permits exactly two
 * airborne impulses and restores both only when the Chossid's feet truly meet the terrain.
 */

const GRAVITY = 21;
const JUMP_SPEED = 9.2;
const SECOND_JUMP_SPEED = 8.1;

export function prepareMinimalMeadowVertical(runtime, state, deltaSeconds) {
	const ground = runtime.terrain.heightAt(state.x, state.z);
	if (runtime.input.consumeJump() && canJump(state)) beginJump(runtime, state);
	if (state.grounded) {
		state.renderY = ground;
		state.velY = 0;
		state.airPhase = 'ground';
		return;
	}
	state.velY -= GRAVITY * deltaSeconds;
	state.renderY += state.velY * deltaSeconds;
	if (state.velY < 0) state.airPhase = 'falling';
}

export function finishMinimalMeadowVertical(runtime, state) {
	const ground = runtime.terrain.heightAt(state.x, state.z);
	state.groundY = ground;
	if (!state.grounded && state.renderY > ground) {
		state.y = state.renderY;
		return;
	}
	state.renderY = ground;
	state.y = ground;
	state.velY = 0;
	state.grounded = true;
	state.jumpsUsed = 0;
	state.airPhase = 'ground';
}

function canJump(state) {
	return state.grounded || state.jumpsUsed < 2;
}

function beginJump(runtime, state) {
	if (state.grounded) state.jumpsUsed = 0;
	state.jumpsUsed += 1;
	state.grounded = false;
	state.velY = state.jumpsUsed === 1 ? JUMP_SPEED : SECOND_JUMP_SPEED;
	state.airPhase = state.jumpsUsed === 1 ? 'jump-one' : 'jump-two';
	runtime.bus?.emit('player:jump', { jump: state.jumpsUsed, speed: state.velY });
}
