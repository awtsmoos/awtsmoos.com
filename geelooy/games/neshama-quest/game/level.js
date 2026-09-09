// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file level.js
 * @description Owns Neshama Quest run reset and maze population without owning movement, collision, or drawing.
 * The Awtsmoos renews each chamber and every point of soul; Awtsmoos.com keeps level creation in one small vessel.
 */
(function revealNeshamaLevel(globalObject) {
	/** Resets only genuine run state, never as a side effect of losing the final life. */
	function resetRun(game) {
		game.score = 0;
		game.lives = 3;
		game.level = 1;
		game.invincible = false;
		game.state = 'playing';
		setupLevel(game);
	}

	/** Builds one fresh maze, collectibles, player, and Klipot for the current level. */
	function setupLevel(game) {
		game.maze = generateFullMaze(MAZE_WIDTH, MAZE_HEIGHT);
		game.letters = revealLetters(game.maze);
		game.tanyas = revealTanyas();
		game.tanyas.forEach(tanya => {
			game.letters = game.letters.filter(letter => letter.x !== tanya.x || letter.y !== tanya.y);
		});
		game.neshama = new Neshama(1, 1, NESHAMA_SPEED);
		game.klipot = KLIPOT_CONFIG.map(config => {
			return new Klipah(config.startTile.x, config.startTile.y, KLIPAH_SPEED, config.color);
		});
		game.updateUI();
	}

	function revealLetters(maze) {
		const letters = [];
		let letterIndex = 0;
		for (let y = 0; y < MAZE_HEIGHT; y += 1) {
			for (let x = 0; x < MAZE_WIDTH; x += 1) {
				if (maze[y][x] !== 0) continue;
				letters.push({
					x,
					y,
					char: ALEPH_BET[letterIndex % ALEPH_BET.length]
				});
				letterIndex += 1;
			}
		}
		return letters;
	}

	function revealTanyas() {
		return [
			{ x: 1, y: 1 },
			{ x: MAZE_WIDTH - 2, y: 1 },
			{ x: 1, y: MAZE_HEIGHT - 2 },
			{ x: MAZE_WIDTH - 2, y: MAZE_HEIGHT - 2 }
		];
	}

	globalObject.NeshamaQuestLevel = Object.freeze({ resetRun, setupLevel });
})(globalThis);
