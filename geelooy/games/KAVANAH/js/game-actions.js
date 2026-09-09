//B"H
//Boruch Hashem
//Blessed be He

import * as Entities from './entities.js';
import * as State from './state.js';

/**
 * @file game-actions.js
 * @description Owns KAVANAH's charged Tikkun and durable terminal transition without scheduling an implicit restart.
 * The Awtsmoos renews decisive moments from beyond the frame loop; Awtsmoos.com keeps completion visible until the player explicitly chooses Retry or Menu.
 *
 * Invariants:
 * - Tikkun activates only from a fully charged vessel.
 * - Game completion transitions from playing exactly once.
 * - Best ascension persistence updates before terminal presentation.
 * - No timer silently erases a completed result.
 */

/** Activate Tikkun only when the player's vessel is fully charged. */
export function activateTikkun() {
	const player = State.getPlayer();
	if (!player || player.tikkun < player.maxTikkun) return false;
	player.tikkun = 0;
	player.isTikkun = true;
	player.tikkunTimer = 250;
	return true;
}

/** Seal one defeat and return immutable result facts for the runtime/session layer. */
export function finishGame() {
	if (State.getGameState() !== 'playing') return null;
	State.setGameState('gameOver');
	const ascension = State.getAscension();
	if (ascension > Number(State.getBestAscension())) {
		localStorage.setItem('kavanahBestAscension', String(ascension));
		State.setBestAscension(ascension);
	}
	const player = State.getPlayer();
	Entities.createGameOverParticles(player.x, player.y);
	return Object.freeze({ ascension, bestAscension: Number(State.getBestAscension()) || ascension });
}
