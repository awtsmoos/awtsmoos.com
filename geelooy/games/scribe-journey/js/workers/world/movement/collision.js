// B"H

import { blocksMovement, getEntityAt } from '../entity/occupancy.js';
import { DIRECTION_VECTORS } from './directions.js';

const SOLID_TILES = new Set([
	'🌳', '🏠', '🪨', '🔥', '🌊', '💎', '📜', '📚', '🕳️', '👨‍🏫',
	'👨', '👨‍🌾', '🐂', '🛒', '🚪', '☁️', '⬛', '🧱', '🛡️', '⚠️',
	'🌲', '🪵', '🍄', '🌵', '🐪', '⛰️', '🧗', '🦅', '🚤', '🦈',
	'🏝️', '🕸️', '🕷️', '💀', '🏛️', '🗼'
]);

/**
 * Reads the next tile as evidence before motion begins. Art, entities, bots,
 * and map edges each speak separately so a blocked step has an honest reason.
 */
export function inspectDestination(state, direction) {
	const vector = DIRECTION_VECTORS[direction];
	const map = state.maps?.[state.currentMapId];
	if (!vector || !map) return { allowed: false, reason: 'missing-map' };

	const targetX = state.player.x + vector.x;
	const targetY = state.player.y + vector.y;
	const height = map.baseLayer?.length || 0;
	const width = map.width || map.baseLayer?.[0]?.length || 0;
	const outside = targetX < 0 || targetY < 0 || targetX >= width || targetY >= height;
	if (outside) return { allowed: true, outside, targetX, targetY };

	const tile = map.baseLayer?.[targetY]?.[targetX];
	if (SOLID_TILES.has(tile)) return { allowed: false, reason: 'solid-tile', targetX, targetY };

	const entity = getEntityAt(map, targetX, targetY);
	if (blocksMovement(entity)) return { allowed: false, reason: 'entity', targetX, targetY };

	const bot = state.bots?.find(candidate => {
		const botX = candidate.targetX ?? candidate.x;
		const botY = candidate.targetY ?? candidate.y;
		return candidate.mapId === state.currentMapId && botX === targetX && botY === targetY;
	});
	if (bot) return { allowed: false, reason: 'bot', targetX, targetY };

	return { allowed: true, outside: false, targetX, targetY };
}
