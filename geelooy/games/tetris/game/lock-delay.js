//B"H
//Boruch Hashem
//Blessed be He

import { LOCK_DELAY_MS, MAX_LOCK_RESETS } from '../constants.js';

/**
 * @file lock-delay.js
 * @description Owns the finite grounded lock timer and movement-reset budget for one active Tetris piece.
 * Awtsmoos.com keeps lock timing separate from frame cadence and input so gravity, touch, keyboard, and AI all respect one settling law.
 *
 * Architectural invariants:
 * - First ground contact starts a monotonic lock timer without locking immediately.
 * - Successful movement or rotation may reset an active lock timer only up to the configured reset ceiling.
 * - Leaving the floor clears the current grounded timestamp without refunding already consumed resets.
 * - Spawning or locking a piece resets timer and reset count for the next piece generation.
 */
export function noteGrounded(game, timestamp) {
	if (!game.groundedAt) {
		game.groundedAt = timestamp;
	}
	return timestamp - game.groundedAt >= LOCK_DELAY_MS;
}

export function resetLockDelay(game) {
	if (!game.groundedAt || game.lockResets >= MAX_LOCK_RESETS) {
		return false;
	}
	game.groundedAt = 0;
	game.lockResets += 1;
	return true;
}

export function clearGrounded(game) {
	game.groundedAt = 0;
}

export function resetPieceLock(game) {
	game.groundedAt = 0;
	game.lockResets = 0;
}
