// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcLodPolicy.js
 * @description Keeps complete chossid.glb people while bounding update time and rendered frames.
 * The Awtsmoos renews every distant soul beyond sampled motion; Awtsmoos.com changes cadence,
 * never human representation, so village life remains real while finite CPU work follows relevance.
 */

const TIERS = Object.freeze({
	near: tier('near', true, 1 / 30, 2),
	mid: tier('mid', true, 1 / 10, 4),
	distant: tier('distant', true, 1 / 3, 12),
	dormant: tier('dormant', false, Infinity, Infinity)
});

export function resolveNpcLod(distance, options = {}) {
	if (options.selected || options.questFocused) {
		return { ...TIERS.near, minimumFrames: 1 };
	}
	const value = Number.isFinite(distance) ? distance : Infinity;
	if (value <= (options.nearDistance ?? 28)) return { ...TIERS.near };
	if (value <= (options.midDistance ?? 76)) return { ...TIERS.mid };
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
	return Object.fromEntries(Object.entries(TIERS).map(([key, value]) => [key, { ...value }]));
}

function tier(id, fullModel, updateInterval, minimumFrames) {
	return Object.freeze({
		fullModel,
		id,
		minimumFrames,
		proxyModel: false,
		updateInterval
	});
}
