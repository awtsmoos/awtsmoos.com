// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movement.js
 * @description Owns Neshama Quest grid legality, tunnel wrapping, and deterministic entity translation.
 * The Awtsmoos renews every step before one tile can become a prison; Awtsmoos.com keeps physical movement separate from enemy thought.
 */
(function revealNeshamaMovement(globalObject) {
	/**
	 * Tests one tile while preserving the intentional horizontal center tunnel.
	 * @param {object} game Active run state.
	 * @param {number} x Tile column.
	 * @param {number} y Tile row.
	 * @returns {boolean} Whether the requested tile blocks movement.
	 */
	function isWall(game, x, y) {
		const tunnelY = Math.floor(MAZE_HEIGHT / 2);
		if (y === tunnelY && (x < 0 || x >= MAZE_WIDTH)) return false;
		if (x < 0 || x >= MAZE_WIDTH || y < 0 || y >= MAZE_HEIGHT) return true;
		return game.maze[y][x] === 1;
	}

	/**
	 * Advances one grid-bound actor without permitting diagonal drift through maze corners.
	 * @param {object} game Active run state.
	 * @param {object} entity Neshama or Klipah movement vessel.
	 * @param {{x:number,y:number}} intendedDirection Requested heading.
	 * @param {number} deltaTime Bounded seconds since the previous frame.
	 */
	function moveEntity(game, entity, intendedDirection, deltaTime) {
		wrapTunnel(entity);
		if (entity.isAtTileCenter(deltaTime)) {
			entity.px = entity.tileX * TILE_SIZE;
			entity.py = entity.tileY * TILE_SIZE;
			chooseDirection(game, entity, intendedDirection);
		}
		if (entity.direction.x !== 0) entity.py = entity.tileY * TILE_SIZE;
		else if (entity.direction.y !== 0) entity.px = entity.tileX * TILE_SIZE;
		entity.px += entity.direction.x * entity.speed * deltaTime;
		entity.py += entity.direction.y * entity.speed * deltaTime;
		entity.tileX = Math.floor((entity.px + TILE_SIZE / 2) / TILE_SIZE);
		entity.tileY = Math.floor((entity.py + TILE_SIZE / 2) / TILE_SIZE);
	}

	/** Chooses the requested legal direction, otherwise continuing forward or stopping cleanly. */
	function chooseDirection(game, entity, intended) {
		if (!isWall(game, entity.tileX + intended.x, entity.tileY + intended.y)) {
			entity.direction = { ...intended };
			return;
		}
		if (!isWall(game, entity.tileX + entity.direction.x, entity.tileY + entity.direction.y)) return;
		entity.direction = { x: 0, y: 0 };
	}

	/** Wraps an actor through the intentional center tunnel without mutating vertical position. */
	function wrapTunnel(entity) {
		if (entity.tileY !== Math.floor(MAZE_HEIGHT / 2)) return;
		if (entity.px > MAZE_WIDTH * TILE_SIZE) entity.px = -TILE_SIZE + 1;
		if (entity.px < -TILE_SIZE) entity.px = MAZE_WIDTH * TILE_SIZE - 1;
	}

	globalObject.NeshamaQuestMovement = Object.freeze({
		isWall,
		moveEntity
	});
})(globalThis);
