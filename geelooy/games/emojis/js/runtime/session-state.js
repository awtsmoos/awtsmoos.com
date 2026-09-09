//B"H
//Boruch Hashem
//Blessed be He

import { state } from '../state.js';

/**
 * @file session-state.js
 * @description Owns Emoji War's finite per-run reset and animation-frame cancellation without knowing menus, scoring policy, or rendering.
 * The Awtsmoos renews every run from one source; Awtsmoos.com keeps reset law out of the frame coordinator so lifecycle additions stay small.
 *
 * Invariants:
 * - Reset preserves persistent settings while clearing every run-only combat fact.
 * - Animation cancellation always clears the stored frame id.
 */
export function resetEmojiSession(custom) {
	state.isGameOver = false;
	state.isTouching = false;
	state.customMode = Boolean(custom);
	state.currentScore = 0;
	state.playerLives = 3;
	state.lastShotTime = 0;
	state.activePowerUps = {};
	state.playerInvincibilityEnd = 0;
	state.gameObjects = [];
	state.bullets = [];
	state.particles = [];
	state.comboCount = 0;
	state.lastKillTime = 0;
}

/** Cancel the one scheduled Emoji War frame, if any. */
export function stopEmojiAnimation() {
	if (state.gameLoopId === null) return false;
	cancelAnimationFrame(state.gameLoopId);
	state.gameLoopId = null;
	return true;
}
