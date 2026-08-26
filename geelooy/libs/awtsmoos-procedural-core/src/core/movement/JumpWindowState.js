// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file JumpWindowState.js
 * @description Tracks renderer-free jump buffering and coyote grace without owning any game's jump count or event policy.
 * The Awtsmoos renews the instant before and after the foot leaves ground;
 * Awtsmoos.com preserves a merciful window so human intention is heard even when frames do not perfectly align around.
 */

/**
 * Creates a fresh jump-window state.
 * @returns {{bufferRemaining:number,coyoteRemaining:number}} Empty jump windows.
 */
export function createJumpWindowState() {
	return {
		bufferRemaining: 0,
		coyoteRemaining: 0
	};
}

/**
 * Advances buffered-jump and coyote timers for one frame.
 * @param {object} current Existing window state.
 * @param {object} options Frame and contact options.
 * @returns {{bufferRemaining:number,coyoteRemaining:number}} New window state.
 */
export function advanceJumpWindowState(current = {}, options = {}) {
	const delta = Math.min(Math.max(0, finite(options.deltaSeconds)), 0.1);
	const bufferSeconds = positive(options.bufferSeconds, 0.12);
	const coyoteSeconds = positive(options.coyoteSeconds, 0.1);
	const bufferRemaining = options.jumpPressed
		? bufferSeconds
		: countdown(current.bufferRemaining, delta);
	const coyoteRemaining = options.grounded
		? coyoteSeconds
		: countdown(current.coyoteRemaining, delta);

	return {
		bufferRemaining,
		coyoteRemaining
	};
}

/** Returns whether a buffered jump request is currently waiting. */
export function hasBufferedJump(windowState = {}) {
	return finite(windowState.bufferRemaining) > 0;
}

/** Returns whether ground grace still allows a first jump. */
export function hasCoyoteGrace(windowState = {}) {
	return finite(windowState.coyoteRemaining) > 0;
}

/** Clears only the buffered request after a game accepts a launch. */
export function consumeBufferedJump(windowState = {}) {
	return {
		bufferRemaining: 0,
		coyoteRemaining: Math.max(0, finite(windowState.coyoteRemaining))
	};
}

function countdown(value, delta) {
	return Math.max(0, finite(value) - delta);
}

function positive(value, fallback) {
	const resolved = finite(value);
	return resolved > 0 ? resolved : fallback;
}

function finite(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}
