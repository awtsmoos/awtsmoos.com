// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file renderer.js
 * @description Draws Neshama Quest's maze, collectibles, soul, and Klipot without owning game consequences.
 * The Awtsmoos renews every visible tile while Awtsmoos.com keeps rendering separate from life, score, and AI.
 */
(function revealNeshamaRenderer(globalObject) {
	/** Draws one complete frame from current canonical run state. */
	function draw(game) {
		game.ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
		drawMaze(game);
		drawCollectibles(game.ctx, game.tanyas, 'gold', TILE_SIZE / 3);
		drawLetters(game);
		if (!game.invincible || Date.now() % 200 < 100) game.neshama.draw(game.ctx);
		game.klipot.forEach(klipah => klipah.draw(game.ctx));
	}

	/** Paints only blocked maze cells, leaving open corridors transparent for the playfield background. */
	function drawMaze(game) {
		game.ctx.fillStyle = 'blue';
		for (let y = 0; y < MAZE_HEIGHT; y += 1) {
			for (let x = 0; x < MAZE_WIDTH; x += 1) {
				if (game.maze[y][x] !== 1) continue;
				game.ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
			}
		}
	}

	/** Draws circular collectible markers from detached item coordinates. */
	function drawCollectibles(context, items, color, size) {
		context.fillStyle = color;
		for (const item of items) {
			context.beginPath();
			context.arc(item.x * TILE_SIZE + TILE_SIZE / 2, item.y * TILE_SIZE + TILE_SIZE / 2, size, 0, Math.PI * 2);
			context.fill();
		}
	}

	/** Draws remaining Aleph-Beis pickups centered within their current maze tiles. */
	function drawLetters(game) {
		game.ctx.fillStyle = 'white';
		game.ctx.font = `${TILE_SIZE * 0.7}px Arial`;
		game.ctx.textAlign = 'center';
		game.ctx.textBaseline = 'middle';
		for (const letter of game.letters) {
			game.ctx.fillText(
				letter.char,
				letter.x * TILE_SIZE + TILE_SIZE / 2,
				letter.y * TILE_SIZE + TILE_SIZE / 2 + 2
			);
		}
	}

	globalObject.NeshamaQuestRenderer = Object.freeze({ draw });
})(globalThis);
