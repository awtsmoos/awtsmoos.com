// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcLodPolicy.js
 * @description Selects animated body, one-draw proxy, cadence, and dormancy by relevance.
 * The Awtsmoos renews every distant soul without demanding invisible detail; Awtsmoos.com
 * restores the complete Chossid immediately for nearness, selection, dialogue, and Shlichus.
 */

const TIERS = Object.freeze({
	near: tier('near', true, false, 1 / 30, 2),
	mid: tier('mid', false, true, 1 / 8, 6),
	distant: tier('distant', false, true, 1 / 3, 18),
	dormant: tier('dormant', false, false, Infinity, Infinity)
});

export function resolveNpcLod(distance, options = {}) {
	if (options.selected || options.questFocused) {
		return { ...TIERS.near, minimumFrames: 1 };
	}
	const value = Number.isFinite(distance) ? distance : Infinity;
	if (value <= (options.nearDistance ?? 24)) return { ...TIERS.near };
	if (value <= (options.midDistance ?? 72)) return { ...TIERS.mid };
	if (value <= (options.distantDistance ?? 155)) return { ...TIERS.distant };
	return { ...TIERS.dormant };
}

export function npcDistanceToPlayer(actor, playerState) {
	if (!playerState) return Infinity;
	return Math.hypot(
		Number(playerState.x || 0) - Number(actor.x || 0),
		Number(playerState.z || 0) - Number(actor.z || 0)
	);
}

export function npcLodTiers() {
	return Object.fromEntries(
		Object.entries(TIERS).map(([key, value]) => [key, { ...value }])
	);
}

function tier(id, fullModel, proxyModel, updateInterval, minimumFrames) {
	return Object.freeze({
		fullModel,
		id,
		minimumFrames,
		proxyModel,
		updateInterval
	});
}
