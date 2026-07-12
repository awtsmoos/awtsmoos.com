// B"H

import { TILE_SIZE } from '../data/database.js';
import { resolveTileVisual } from './tileVisualResolver.js';
import { EMOJI_FONT, stableHash, WORLD_THEME } from './theme.js';

function surfaceFor(tile) {
	if (/🌊|💧|🧊/.test(tile)) return WORLD_THEME.water;
	if (/🌵|🐪|🏜️/.test(tile)) return WORLD_THEME.sand;
	if (/🪨|⛰️|🧱|⬛/.test(tile)) return WORLD_THEME.stone;
	if (/✨|🔯|📜|📚|💎/.test(tile)) return WORLD_THEME.mystic;
	if (/🌱|🌿|🌳|🌲|🍄/.test(tile)) return WORLD_THEME.grass;
	return WORLD_THEME.path;
}

function visibleBounds(map, camera) {
	const width = map.width || map.baseLayer?.[0]?.length || 0;
	const height = map.baseLayer?.length || 0;
	return {
		startX: Math.max(0, Math.floor(-camera.x / TILE_SIZE) - 1),
		endX: Math.min(width - 1, Math.ceil((-camera.x + camera.viewport.width) / TILE_SIZE) + 1),
		startY: Math.max(0, Math.floor(-camera.y / TILE_SIZE) - 1),
		endY: Math.min(height - 1, Math.ceil((-camera.y + camera.viewport.height) / TILE_SIZE) + 1)
	};
}

function drawLayer(ctx, map, layer, camera, overlay) {
	if (!layer?.length) return;
	const bounds = visibleBounds(map, camera);
	ctx.font = `${Math.round(TILE_SIZE * 0.68)}px ${EMOJI_FONT}`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	for (let y = bounds.startY; y <= bounds.endY; y += 1) {
		for (let x = bounds.startX; x <= bounds.endX; x += 1) {
			const rawTile = layer[y]?.[x];
			const tile = resolveTileVisual(map, rawTile);
			if (!tile) continue;
			const screenX = x * TILE_SIZE + camera.x;
			const screenY = y * TILE_SIZE + camera.y;

			if (!overlay) {
				const variation = stableHash(`${x}:${y}:${rawTile}`) % 11;
				ctx.fillStyle = surfaceFor(tile);
				ctx.globalAlpha = 0.82 + variation / 60;
				ctx.fillRect(screenX, screenY, TILE_SIZE + 1, TILE_SIZE + 1);
				ctx.globalAlpha = 0.12;
				ctx.strokeStyle = '#ffffff';
				ctx.strokeRect(screenX + 0.5, screenY + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
			}

			ctx.globalAlpha = overlay ? 1 : 0.9;
			ctx.fillText(tile, screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2 + 1);
		}
	}
	ctx.globalAlpha = 1;
}

export function drawTerrain(ctx, map, camera) {
	drawLayer(ctx, map, map.baseLayer, camera, false);
	drawLayer(ctx, map, map.overlayLayer, camera, true);
}
