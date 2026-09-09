// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ai.js
 * @description Chooses Klipah routes independently from physical movement so enemy thought can evolve without destabilizing grid motion.
 * The Awtsmoos renews pursuit and retreat before finite strategy can harden; Awtsmoos.com keeps AI readable and replaceable.
 */
(function revealNeshamaAi(globalObject) {
	const movement = globalObject.NeshamaQuestMovement;

	/**
	 * Reconsiders a Klipah route at tile centers, then advances it through the shared movement law.
	 * @param {object} game Active run state.
	 * @param {object} klipah Enemy vessel.
	 * @param {number} deltaTime Bounded frame time in seconds.
	 */
	function updateKlipah(game, klipah, deltaTime) {
		if (klipah.isAtTileCenter(deltaTime)) chooseDirection(game, klipah);
		movement.moveEntity(game, klipah, klipah.direction, deltaTime);
	}

	/** Selects chase or flee behavior from legal non-reversing directions. */
	function chooseDirection(game, klipah) {
		const directions = availableDirections(game, klipah);
		if (!directions.length) {
			if (klipah.direction.x || klipah.direction.y) {
				klipah.direction = { x: -klipah.direction.x, y: -klipah.direction.y };
			}
			return;
		}
		klipah.direction = klipah.isVulnerable
			? farthestFromTarget(game, klipah, directions)
			: nearestToNeshama(game, klipah, directions);
	}

	/** Returns legal headings while avoiding immediate reversal when alternatives exist. */
	function availableDirections(game, klipah) {
		const result = [];
		const { x, y } = klipah.direction;
		if (!movement.isWall(game, klipah.tileX + 1, klipah.tileY) && x !== -1) result.push({ x: 1, y: 0 });
		if (!movement.isWall(game, klipah.tileX - 1, klipah.tileY) && x !== 1) result.push({ x: -1, y: 0 });
		if (!movement.isWall(game, klipah.tileX, klipah.tileY + 1) && y !== -1) result.push({ x: 0, y: 1 });
		if (!movement.isWall(game, klipah.tileX, klipah.tileY - 1) && y !== 1) result.push({ x: 0, y: -1 });
		return result;
	}

	/** Chooses the heading that most directly approaches the player. */
	function nearestToNeshama(game, klipah, directions) {
		return directions.reduce((best, direction) => {
			const distance = Math.hypot(
				klipah.tileX + direction.x - game.neshama.tileX,
				klipah.tileY + direction.y - game.neshama.tileY
			);
			return distance < best.distance ? { direction, distance } : best;
		}, { direction: directions[0], distance: Infinity }).direction;
	}

	/** Chooses a vulnerable retreat heading away from the player's current quadrant. */
	function farthestFromTarget(game, klipah, directions) {
		const target = {
			x: game.neshama.tileX < MAZE_WIDTH / 2 ? MAZE_WIDTH : 0,
			y: game.neshama.tileY < MAZE_HEIGHT / 2 ? MAZE_HEIGHT : 0
		};
		return directions.reduce((best, direction) => {
			const distance = Math.hypot(
				klipah.tileX + direction.x - target.x,
				klipah.tileY + direction.y - target.y
			);
			return distance > best.distance ? { direction, distance } : best;
		}, { direction: directions[0], distance: -1 }).direction;
	}

	globalObject.NeshamaQuestAi = Object.freeze({ updateKlipah });
})(globalThis);
