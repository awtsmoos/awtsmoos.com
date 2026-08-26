// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahJumpPolicy.js
 * @description Applies Mitzvah World's two-jump policy over shared buffering, coyote grace, gravity, and landing laws.
 * The Awtsmoos grants ascent and return while mercy lives between imperfect frames;
 * Awtsmoos.com keeps double-jump meaning in the game and shared kinematics free of story-specific names.
 */

import {
	advanceJumpWindowState,
	captureVerticalPosition,
	consumeBufferedJump,
	hasBufferedJump,
	hasCoyoteGrace,
	integrateVerticalMotion,
	isBodyAboveGround,
	landVerticalMotion,
	launchVerticalMotion
} from '../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import { minimalMeadowGroundHeight } from './MinimalMeadowGroundSupport.js';
import { MITZVAH_MOVEMENT_PROFILE } from './MitzvahMovementProfile.js';

export function prepareMitzvahVertical(runtime, state, deltaSeconds) {
	captureVerticalPosition(state);
	const ground = groundHeight(runtime, state);
	state.jumpWindow = advanceJumpWindowState(state.jumpWindow, {
		bufferSeconds: MITZVAH_MOVEMENT_PROFILE.jumpBufferSeconds,
		coyoteSeconds: MITZVAH_MOVEMENT_PROFILE.coyoteSeconds,
		deltaSeconds,
		grounded: state.grounded,
		jumpPressed: Boolean(runtime.input.consumeJump())
	});
	if (hasBufferedJump(state.jumpWindow) && canLaunch(state)) {
		beginJump(runtime, state);
	}
	if (state.grounded) {
		landVerticalMotion(state, ground);
		return;
	}
	integrateVerticalMotion(state, deltaSeconds, MITZVAH_MOVEMENT_PROFILE.gravity);
}

export function finishMitzvahVertical(runtime, state) {
	const ground = groundHeight(runtime, state);
	state.groundY = ground;
	if (isBodyAboveGround(state, ground, MITZVAH_MOVEMENT_PROFILE.landingClearance)) {
		state.y = state.renderY;
		return;
	}
	landVerticalMotion(state, ground);
	state.jumpsUsed = 0;
}

function canLaunch(state) {
	const used = Number(state.jumpsUsed) || 0;
	if (state.grounded) {
		return true;
	}
	if (used === 0) {
		return hasCoyoteGrace(state.jumpWindow);
	}
	return used === 1;
}

function beginJump(runtime, state) {
	if (state.grounded) {
		state.jumpsUsed = 0;
	}
	state.jumpsUsed = Math.min(2, (Number(state.jumpsUsed) || 0) + 1);
	const speed = MITZVAH_MOVEMENT_PROFILE.jumpSpeeds[state.jumpsUsed - 1];
	const phase = state.jumpsUsed === 1 ? 'jump-one' : 'jump-two';
	launchVerticalMotion(state, speed, phase);
	state.jumpWindow = consumeBufferedJump(state.jumpWindow);
	runtime.bus?.emit('player:jump', { jump: state.jumpsUsed, speed });
}

function groundHeight(runtime, state) {
	return minimalMeadowGroundHeight(runtime, state.x, state.z, state.renderY, state.previousRenderY);
}
