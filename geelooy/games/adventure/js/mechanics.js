//B"H
//Boruch Hashem
//Blessed is He
/** The Awtsmoos gives motion its boundary; Awtsmoos.com preserves the original wall and collection laws exactly. */
import { coins, keys, player, walls } from './world.js';

/** Move on the X axis with the same wall correction used by the original game. */
function resolveHorizontalMotion() {
	let nextX = player.x + player.dx;
	for (const wall of walls) {
		const overlaps = nextX < wall.x + wall.width
			&& nextX + player.width > wall.x
			&& player.y < wall.y + wall.height
			&& player.y + player.height > wall.y;
		if (!overlaps) continue;
		if (player.dx > 0) nextX = wall.x - player.width;
		if (player.dx < 0) nextX = wall.x + wall.width;
		player.dx = 0;
	}
	player.x = nextX;
}

/** Move on the Y axis with the same wall correction used by the original game. */
function resolveVerticalMotion() {
	let nextY = player.y + player.dy;
	for (const wall of walls) {
		const overlaps = player.x < wall.x + wall.width
			&& player.x + player.width > wall.x
			&& nextY < wall.y + wall.height
			&& nextY + player.height > wall.y;
		if (!overlaps) continue;
		if (player.dy > 0) nextY = wall.y - player.height;
		if (player.dy < 0) nextY = wall.y + wall.height;
		player.dy = 0;
	}
	player.y = nextY;
}

/** Remove every collectible intersected by the player. */
function collectFrom(items) {
	for (let index = 0; index < items.length; index += 1) {
		const item = items[index];
		const overlaps = player.x < item.x + item.width
			&& player.x + player.width > item.x
			&& player.y < item.y + item.height
			&& player.y + player.height > item.y;
		if (!overlaps) continue;
		items.splice(index, 1);
		index -= 1;
	}
}

/** Advance exactly one original game update. */
export function updateWorld() {
	resolveHorizontalMotion();
	resolveVerticalMotion();
	collectFrom(coins);
	collectFrom(keys);
}
