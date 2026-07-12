// B"H

import { TILE_SIZE } from '../data/database.js';
import { viewportOf } from './theme.js';

const LOOK_AHEAD = {
	up: { x: 0, y: -18 },
	down: { x: 0, y: 18 },
	left: { x: -18, y: 0 },
	right: { x: 18, y: 0 }
};

function boundedOffset(target, viewportSize, worldSize) {
	if (worldSize <= viewportSize) return (viewportSize - worldSize) / 2;
	return Math.min(0, Math.max(viewportSize - worldSize, target));
}

/**
 * Centers the traveler while honoring the finite map edges. The camera looks a
 * little ahead, as hope does, but never peers beyond the world that exists.
 */
export function createCamera(ctx, map, player, shake = 0) {
	const viewport = viewportOf(ctx);
	const widthInTiles = map.width || map.baseLayer?.[0]?.length || 0;
	const heightInTiles = map.baseLayer?.length || 0;
	const worldWidth = widthInTiles * TILE_SIZE;
	const worldHeight = heightInTiles * TILE_SIZE;
	const look = LOOK_AHEAD[player.direction] || LOOK_AHEAD.down;
	const randomX = shake ? (Math.random() - 0.5) * shake : 0;
	const randomY = shake ? (Math.random() - 0.5) * shake : 0;

	const targetX = viewport.width / 2 - (player.pixelX + TILE_SIZE / 2) - look.x + randomX;
	const targetY = viewport.height / 2 - (player.pixelY + TILE_SIZE / 2) - look.y + randomY;
	return {
		x: Math.round(boundedOffset(targetX, viewport.width, worldWidth)),
		y: Math.round(boundedOffset(targetY, viewport.height, worldHeight)),
		viewport,
		worldWidth,
		worldHeight
	};
}
