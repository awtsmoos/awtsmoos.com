// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowLootDropState.js
 * @description Projects local or authoritative corpses into exact physical drop and range records.
 * The Awtsmoos joins fallen body and reward without inventing hidden treasure;
 * Awtsmoos.com keeps pickup range, local contents, authoritative opacity, position, and identity explicit.
 */

export const MINIMAL_MEADOW_LOOT_PICKUP_RANGE = 4.25;

export function createMinimalMeadowLootDrop(actor) {
	if (!actor || actor.alive || actor.looted) return null;
	const items = localLootItems(actor);
	const authoritativeAvailable = authoritativeLootAvailable(actor);
	if (!items.length && !authoritativeAvailable) return null;
	const enemyId = actor.profile?.id || actor.serverCreatureId;
	const position = actor.group?.position || {};
	return Object.freeze({
		authoritative: Boolean(actor.authoritative),
		enemyId,
		id: `corpse:${enemyId}`,
		items: Object.freeze(items.map(item => Object.freeze({ ...item }))),
		lootStatus: actor.authoritativeCreature?.lootStatus || 'local',
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
	return minimalMeadowLootDropDistance(runtime, drop)
		<= MINIMAL_MEADOW_LOOT_PICKUP_RANGE;
}

export function minimalMeadowLootActor(runtime, enemyId) {
	return runtime.enemies?.actors?.find(actor => {
		return (actor.profile?.id || actor.serverCreatureId) === enemyId;
	}) || null;
}

function authoritativeLootAvailable(actor) {
	return Boolean(
		actor.authoritative
		&& actor.authoritativeCreature?.status !== 'active'
		&& actor.authoritativeCreature?.lootStatus === 'available'
	);
}

function localLootItems(actor) {
	if (actor.authoritative) return [];
	const items = actor.lootState?.snapshot?.();
	return Array.isArray(items) ? items : [];
}

function finite(value) {
	return Number.isFinite(Number(value)) ? Number(value) : 0;
}
