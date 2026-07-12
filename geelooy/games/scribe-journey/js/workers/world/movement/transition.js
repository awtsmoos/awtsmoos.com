// B"H

import { TILE_SIZE } from '../../../data/database.js';
import { maps as mapRegistry } from '../../../data/maps.js';
import { generateChunk } from '../../../procedural/world_generator.js';

/**
 * Crosses a map edge only after the full step is complete. Generated worlds are
 * registered in the same living map registry so the next frame cannot forget them.
 */
export function transitionAcrossEdge(state) {
	const map = state.maps?.[state.currentMapId];
	if (!map) return false;

	const player = state.player;
	const width = map.width || map.baseLayer?.[0]?.length || 0;
	const height = map.baseLayer?.length || 0;
	let worldX = map.worldX || 0;
	let worldY = map.worldY || 0;
	let destinationX = player.x;
	let destinationY = player.y;

	if (player.x < 0) { worldX -= 1; destinationX = width - 2; }
	else if (player.x >= width) { worldX += 1; destinationX = 1; }
	else if (player.y < 0) { worldY -= 1; destinationY = height - 2; }
	else if (player.y >= height) { worldY += 1; destinationY = 1; }
	else return false;

	const mapId = `world_${worldX}_${worldY}`;
	const generatedMap = state.generatedMaps?.[mapId] || mapRegistry[mapId] || generateChunk(worldX, worldY);
	state.generatedMaps = { ...(state.generatedMaps || {}), [mapId]: generatedMap };
	mapRegistry[mapId] = generatedMap;
	state.maps[mapId] = generatedMap;
	state.currentMapId = mapId;

	Object.assign(player, {
		x: destinationX,
		y: destinationY,
		startX: destinationX,
		startY: destinationY,
		targetX: destinationX,
		targetY: destinationY,
		pixelX: destinationX * TILE_SIZE,
		pixelY: destinationY * TILE_SIZE
	});
	return true;
}
