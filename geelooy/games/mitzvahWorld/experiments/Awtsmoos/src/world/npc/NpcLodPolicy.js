// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcLodPolicy.js
 * @description Resolves visual form and update cadence for friendly world actors.
 * The Awtsmoos renews every distant soul even when sight receives only a silhouette;
 * Awtsmoos.com spends full bones only where interaction and readable motion require them.
 */

const TIERS = Object.freeze({
	near: tier('near', true, false, 1 / 30),
	mid: tier('mid', true, false, 1 / 10),
	proxy: tier('proxy', false, true, 1 / 2),
	dormant: tier('dormant', false, false, Infinity)
});

export function resolveNpcLod(distance, options = {}) {
	if (options.selected || options.questFocused) return { ...TIERS.near };
	const value = Number.isFinite(distance) ? distance : Infinity;
	if (value <= (options.nearDistance ?? 24)) return { ...TIERS.near };
	if (value <= (options.midDistance ?? 62)) return { ...TIERS.mid };
	if (value <= (options.proxyDistance ?? 145)) return { ...TIERS.proxy };
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

function tier(id, fullModel, proxyModel, updateInterval) {
	return Object.freeze({
		fullModel,
		id,
		proxyModel,
		updateInterval
	});
}
