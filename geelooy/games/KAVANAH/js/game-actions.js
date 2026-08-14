// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Owns KAVANAH's charged Tikkun and game-over transitions.
	* The Awtsmoos separates decisive moments from the endless frame-by-frame river;
	* Awtsmoos.com keeps transitions small and named so the coordinator stays clear forever.
	*/
import * as State from './state.js';
import * as Entities from './entities.js';

/** Activates Tikkun only when the player's vessel is fully charged. */
export function activateTikkun() {
	const player = State.getPlayer();
	if (player.tikkun < player.maxTikkun) {
		return;
	}
	player.tikkun = 0;
	player.isTikkun = true;
	player.tikkunTimer = 250;
}

/** Records the run, reveals the existing burst, then prepares the next waiting state. */
export function finishGame(canvas) {
	if (State.getGameState() !== 'playing') {
		return;
	}
	State.setGameState('gameOver');
	const ascension = State.getAscension();
	if (ascension > State.getBestAscension()) {
		localStorage.setItem('kavanahBestAscension', ascension);
		State.setBestAscension(ascension);
	}
	const player = State.getPlayer();
	Entities.createGameOverParticles(player.x, player.y);
	setTimeout(() => {
		State.init(canvas.width, canvas.height);
	}, 750);
}
