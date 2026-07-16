// B"H
/** Keeps every visible person on chossid.glb; distance changes animation cadence, never body type. */
const TIERS = Object.freeze({
	near: tier('near', true, 1 / 30),
	mid: tier('mid', true, 1 / 15),
	distant: tier('distant', true, 1 / 6),
	dormant: tier('dormant', false, Infinity)
});

export function resolveNpcLod(distance, options = {}) {
	if (options.selected || options.questFocused) return { ...TIERS.near };
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

function tier(id, fullModel, updateInterval) {
	return Object.freeze({ fullModel, id, proxyModel: false, updateInterval });
}
