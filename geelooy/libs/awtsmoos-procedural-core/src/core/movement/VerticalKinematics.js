// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VerticalKinematics.js
 * @description Supplies game-neutral vertical launch, gravity, airborne integration, and landing transitions.
 * The Awtsmoos renews ascent and descent from the same source beyond above and below;
 * Awtsmoos.com keeps the arithmetic pure so each game may choose its own jump story while sharing one physical flow.
 */

/**
 * Captures the current finite vertical position before a frame advances.
 * @param {object} state Mutable body state.
 * @returns {number} Captured previous height.
 */
export function captureVerticalPosition(state) {
	const previous = finite(state.renderY, state.y);
	state.previousRenderY = previous;
	return previous;
}

/**
 * Launches a body upward without deciding whether the game permits the jump.
 * @param {object} state Mutable body state.
 * @param {number} speed Positive launch speed.
 * @param {string} phase Game-facing airborne phase label.
 * @returns {object} Mutated body state.
 */
export function launchVerticalMotion(state, speed, phase = 'rising') {
	state.grounded = false;
	state.velY = Math.max(0, finite(speed));
	state.airPhase = phase;
	return state;
}

/**
 * Integrates gravity and vertical position for one bounded frame.
 * @param {object} state Mutable body state.
 * @param {number} deltaSeconds Frame duration in seconds.
 * @param {number} gravity Positive downward acceleration.
 * @returns {object} Mutated body state.
 */
export function integrateVerticalMotion(state, deltaSeconds, gravity = 21) {
	if (state.grounded) {
		return state;
	}
	const delta = Math.min(Math.max(0, finite(deltaSeconds)), 0.1);
	state.velY = finite(state.velY) - Math.max(0, finite(gravity)) * delta;
	state.renderY = finite(state.renderY, state.y) + state.velY * delta;
	state.y = state.renderY;
	if (state.velY < 0) {
		state.airPhase = 'falling';
	}
	return state;
}

/**
 * Lands a body on an authoritative finite ground height.
 * @param {object} state Mutable body state.
 * @param {number} groundY Authoritative ground height.
 * @returns {object} Mutated grounded state.
 */
export function landVerticalMotion(state, groundY) {
	const ground = finite(groundY);
	state.renderY = ground;
	state.y = ground;
	state.groundY = ground;
	state.velY = 0;
	state.grounded = true;
	state.airPhase = 'ground';
	return state;
}

/** Returns whether the body remains clearly above its authoritative ground. */
export function isBodyAboveGround(state, groundY, clearance = 0.035) {
	return !state.grounded
		&& finite(state.renderY, state.y) > finite(groundY) + Math.max(0, finite(clearance));
}

function finite(primary, fallback = 0) {
	if (Number.isFinite(Number(primary))) {
		return Number(primary);
	}
	return Number.isFinite(Number(fallback)) ? Number(fallback) : 0;
}
