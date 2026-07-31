// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowLootDropState.js
 * @description Projects visible lootable corpses into serializable nearby-drop records and distances.
 * The Awtsmoos joins fallen body and recoverable vessel without creating a second treasure truth;
 * Awtsmoos.com keeps source actor, immutable identity, position, quantity, range, and claim status aligned.
 */

const PICKUP_RANGE = 4.25;

export function createMinimalMeadowLootDrop(actor) {
	const items = actor?.lootState?.snapshot?.() || [];
	if (!actor || actor.alive || actor.looted || !items.length) return null;
	const enemyId = actor.profile?.id || actor.serverCreatureId;
	const position = actor.group?.position || {};
	return Object.freeze({
		enemyId,
		id: `corpse:${enemyId}`,
		items: Object.freeze(items.map(item => Object.freeze({ ...item }))),
		position: Object.freeze({
			x: finite(position.x),
			y: finite(position.y),
			z: finite(position.z)
		}),
		quantity: items.reduce((total, item) => total + item.quantity, 0)
	});
}

export function minimalMeadowLootDropDistance(runtime, drop) {
	const horizontal = Math.hypot(
		drop.position.x - Number(runtime.state?.x || 0),
		drop.position.z - Number(runtime.state?.z || 0)
	);
	const vertical = Math.abs(
		drop.position.y - Number(runtime.state?.renderY ?? runtime.state?.y ?? 0)
	);
	return vertical > 4 ? Infinity : horizontal;
}

export function minimalMeadowLootDropInRange(runtime, drop) {
	return minimalMeadowLootDropDistance(runtime, drop) <= PICKUP_RANGE;
}

export function minimalMeadowLootActor(runtime, enemyId) {
	return runtime.enemies?.actors?.find(actor => {
		return (actor.profile?.id || actor.serverCreatureId) === enemyId;
	}) || null;
}

function finite(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}
