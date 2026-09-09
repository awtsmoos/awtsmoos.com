// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file collisions.js
 * @description Owns Neshama Quest collection, power-up, Klipah collision, life-loss, and level-completion consequences.
 * The Awtsmoos renews encounter and consequence; Awtsmoos.com makes the final life a real result instead of an invisible reset.
 */
(function revealNeshamaCollisions(globalObject) {
	const { scoreForLetter } = globalObject.NeshamaQuestScoring;
	const { setupLevel } = globalObject.NeshamaQuestLevel;

	/** Resolves every collectible/enemy overlap for the player's current tile. */
	function checkCollisions(game) {
		const { tileX, tileY } = game.neshama;
		game.letters = game.letters.filter(letter => collectLetter(game, letter, tileX, tileY));
		game.tanyas = game.tanyas.filter(tanya => collectTanya(game, tanya, tileX, tileY));
		for (const klipah of game.klipot) resolveKlipahCollision(game, klipah, tileX, tileY);
		if (game.state === 'playing' && game.letters.length === 0) {
			game.level += 1;
			game.showMessage(`Level ${game.level}`);
			setupLevel(game);
		}
	}

	/** Ends the Tanya power window and restores normal Klipah danger once its timer expires. */
	function checkPowerUpTimer(game) {
		if (!game.neshama.isPoweredUp || Date.now() <= game.neshama.powerUpTimer) return;
		game.neshama.isPoweredUp = false;
		game.klipot.forEach(klipah => {
			klipah.isVulnerable = false;
		});
	}

	/** Consumes one Aleph-Beis letter and applies its canonical Gematria score. */
	function collectLetter(game, letter, tileX, tileY) {
		if (letter.x !== tileX || letter.y !== tileY) return true;
		game.score += scoreForLetter(letter.char);
		game.updateUI();
		return false;
	}

	/** Consumes a Tanya pickup and opens a temporary vulnerable-Klipah power window. */
	function collectTanya(game, tanya, tileX, tileY) {
		if (tanya.x !== tileX || tanya.y !== tileY) return true;
		game.score += 50;
		game.neshama.isPoweredUp = true;
		game.neshama.powerUpTimer = Date.now() + NESHAMA_POWERUP_DURATION;
		game.klipot.forEach(klipah => {
			klipah.isVulnerable = true;
		});
		game.updateUI();
		return false;
	}

	/** Applies a vulnerable-enemy reward or routes a dangerous collision into life loss. */
	function resolveKlipahCollision(game, klipah, tileX, tileY) {
		if (klipah.tileX !== tileX || klipah.tileY !== tileY) return;
		if (klipah.isVulnerable) {
			game.score += 200;
			game.updateUI();
			resetKlipah(klipah);
			return;
		}
		if (!game.invincible) handleLifeLost(game);
	}

	/** Transitions the final life into a terminal result; surviving hits reset only actors. */
	function handleLifeLost(game) {
		game.lives -= 1;
		game.invincible = true;
		game.updateUI();
		if (game.lives <= 0) {
			game.finishRun();
			return;
		}
		game.showMessage('-1 Life');
		game.neshama = new Neshama(1, 1, NESHAMA_SPEED);
		game.klipot.forEach(resetKlipah);
		game.input.direction = { x: 0, y: 0 };
		game.input.nextDirection = { x: 0, y: 0 };
		setTimeout(() => {
			if (game.state === 'playing') game.invincible = false;
		}, 2000);
	}

	/** Restores one Klipah to its authored spawn without resetting the run. */
	function resetKlipah(klipah) {
		const config = KLIPOT_CONFIG.find(item => item.color === klipah.color);
		klipah.tileX = config.startTile.x;
		klipah.tileY = config.startTile.y;
		klipah.px = klipah.tileX * TILE_SIZE;
		klipah.py = klipah.tileY * TILE_SIZE;
		klipah.isVulnerable = false;
		klipah.direction = { x: 0, y: 0 };
	}

	globalObject.NeshamaQuestCollisions = Object.freeze({
		checkCollisions,
		checkPowerUpTimer
	});
})(globalThis);
