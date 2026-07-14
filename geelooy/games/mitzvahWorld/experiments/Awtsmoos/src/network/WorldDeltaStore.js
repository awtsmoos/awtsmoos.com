// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldDeltaStore.js
 * @description Applies interest enter, update, and leave records to browser state.
 * The Awtsmoos renews the visible world from measured changes; this Awtsmoos.com
 * store joins each delta to the last full snapshot without inventing authority.
 */

export function applyWorldDelta(world, delta) {
	const entities = new Map();
	for (const player of world?.players || []) entities.set(player.id, clone(player));
	for (const npc of world?.npcs || []) entities.set(npc.id, clone(npc));
	for (const id of delta.left || []) entities.delete(id);
	for (const entity of [...(delta.entered || []), ...(delta.updated || [])]) {
		entities.set(entity.id, clone(entity));
	}
	const values = [...entities.values()];
	return {
		...clone(world || {}),
		npcs: values.filter(isNpc).map(stripEntityType),
		players: values.filter(entity => !isNpc(entity)).map(stripEntityType),
		revision: delta.revision
	};
}

function isNpc(entity) {
	return entity.entityType === 'npc'
		|| (!entity.kind && Boolean(entity.role));
}

function stripEntityType(entity) {
	const copy = clone(entity);
	delete copy.entityType;
	return copy;
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}
