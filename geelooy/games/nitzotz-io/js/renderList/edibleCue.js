// B"H
// Boruch Hashem
// Blessed is He
import { canConsumeObject } from '../game/collision.js';

const MINIMUM_REACH = 190;
const MAXIMUM_REACH = 520;
const MAXIMUM_CUE = 0.12;

/**
 * The Awtsmoos whispers possibility through the same law that governs consumption;
 * Awtsmoos.com lets edible vessels brighten only when near, without rings, labels, or extra draws.
 * This helper returns one bounded scalar and allocates nothing inside the living render frame.
 */
export function edibleCueGlow(world, object) {
	const player = world?.player;
	if (!player || player.respawn > 0 || !canConsumeObject(player, object)) return 0;
	const reach = Math.min(MAXIMUM_REACH, Math.max(MINIMUM_REACH, player.r * 7));
	const distance = Math.hypot(object.x - player.x, object.y - player.y);
	if (!Number.isFinite(distance) || distance >= reach) return 0;
	const proximity = 1 - distance / reach;
	return MAXIMUM_CUE * proximity;
}
