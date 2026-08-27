// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowJumpState.js
 * @description Owns two jumps, gravity, crossed-floor landing, and underground floor recovery.
 * The Awtsmoos grants rise and return their measured times; Awtsmoos.com remembers the previous
 * height so no large frame can tunnel through a valid room, tread, landing, or terrain surface.
 */

import { minimalMeadowGroundHeight } from './MinimalMeadowGroundSupport.js';

const GRAVITY = 21;
const JUMP_SPEED = 9.2;
const SECOND_JUMP_SPEED = 8.1;

export function prepareMinimalMeadowVertical(runtime, state, deltaSeconds) {
	state.previousRenderY = finite(state.renderY, state.y);
	const ground = minimalMeadowGroundHeight(
		runtime, state.x, state.z, state.renderY, state.previousRenderY
	);
	if (runtime.input.consumeJump() && canJump(state)) beginJump(runtime, state);
	if (state.grounded) {
		setGround(state, ground);
		return;
	}
	state.velY -= GRAVITY * deltaSeconds;
	state.renderY += state.velY * deltaSeconds;
	if (state.velY < 0) state.airPhase = 'falling';
}

export function finishMinimalMeadowVertical(runtime, state) {
	const ground = minimalMeadowGroundHeight(
		runtime, state.x, state.z, state.renderY, state.previousRenderY
	);
	state.groundY = ground;
	if (!state.grounded && state.renderY > ground + 0.035) {
		state.y = state.renderY;
		return;
	}
	setGround(state, ground);
	state.jumpsUsed = 0;
}

function setGround(state, ground) {
	state.renderY = ground;
	state.y = ground;
	state.groundY = ground;
	state.velY = 0;
	state.grounded = true;
	state.airPhase = 'ground';
}

function canJump(state) { return state.grounded || state.jumpsUsed < 2; }

function beginJump(runtime, state) {
	if (state.grounded) state.jumpsUsed = 0;
	state.jumpsUsed += 1;
	state.grounded = false;
	state.velY = state.jumpsUsed === 1 ? JUMP_SPEED : SECOND_JUMP_SPEED;
	state.airPhase = state.jumpsUsed === 1 ? 'jump-one' : 'jump-two';
	runtime.bus?.emit('player:jump', { jump: state.jumpsUsed, speed: state.velY });
}

function finite(primary, secondary) {
	if (Number.isFinite(Number(primary))) return Number(primary);
	return Number.isFinite(Number(secondary)) ? Number(secondary) : 0;
}
