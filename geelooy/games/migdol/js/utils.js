//B"H
import {
	TILE_SIZE,
	TOWER_TYPES
} from './config.js';
export function isLocationValid(gridX,
	gridY, game) {
	if (gridX < 0 || gridX >= (game
			.canvas.width / TILE_SIZE
			) || gridY < 0 || gridY >= (
			game.canvas.height /
			TILE_SIZE)) {
		return false;
	}
	for (let i = 0; i < game.path
		.length - 1; i++) {
		const start = game.path[i];
		const end = game.path[i + 1];
		if (start.x === end.x &&
			gridX === start.x &&
			gridY >= Math.min(start.y,
				end.y) && gridY <= Math
			.max(start.y, end.y))
		return false;
		if (start.y === end.y &&
			gridY === start.y &&
			gridX >= Math.min(start.x,
				end.x) && gridX <= Math
			.max(start.x, end.x))
		return false;
	}
	return !game.towers.some(t => Math
		.floor(t.x / TILE_SIZE) ===
		gridX && Math.floor(t.y /
			TILE_SIZE) === gridY);
}