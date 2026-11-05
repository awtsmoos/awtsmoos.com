// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file WorldDeltaStore.js
	* @description Applies validated monotonic entity deltas without cross-type collisions.
	* The Awtsmoos renews players, creatures, and npcs through distinct names and measured revisions;
	* Awtsmoos.com rejects a broken delta before it can erase a truthful world.
	*
	* Stream 4: creature entities (entityType 'creature') are carried in their own
	* map. Before this fix they fell through to the player/npc routing and creature
	* HP / defeat / loot updates from other players' combat never reached the
	* local scene. The enemy-authority sync reads world.creatures, so the downlink
	* depends on this merge.
	*/

export function applyWorldDelta(world, delta) {
	const baseRevision = validRevision(world?.revision, 'world');
	const nextRevision = validRevision(delta?.revision, 'delta');
	if (nextRevision <= baseRevision) {
		throw worldDeltaError(
			'STALE_WORLD_DELTA',
			`World delta ${nextRevision} does not advance ${baseRevision}.`
		);
	}
	const players = entityMap(world?.players, 'player');
	const npcs = entityMap(world?.npcs, 'npc');
	const creatures = entityMap(world?.creatures, 'creature');
	for (const id of normalizedLeft(delta?.left)) {
		players.delete(id);
		npcs.delete(id);
		creatures.delete(id);
	}
	for (const entity of normalizedEntities(delta?.entered, 'entered')) {
		upsertEntity(players, npcs, creatures, entity);
	}
	for (const entity of normalizedEntities(delta?.updated, 'updated')) {
		upsertEntity(players, npcs, creatures, entity);
	}
	return {
		...clone(world || {}),
		creatures: [...creatures.values()].map(stripEntityType),
		npcs: [...npcs.values()].map(stripEntityType),
		players: [...players.values()].map(stripEntityType),
		revision: nextRevision
	};
}

function entityMap(values, fallbackType) {
	const map = new Map();
	for (const value of values || []) {
		const entity = normalizedEntity(value, fallbackType);
		map.set(entity.id, entity);
	}
	return map;
}

function normalizedEntities(values, phase) {
	if (values === undefined) return [];
	if (!Array.isArray(values)) {
		throw worldDeltaError('INVALID_WORLD_DELTA', `${phase} must be an array.`);
	}
	return values.map(value => normalizedEntity(value));
}

function normalizedLeft(values) {
	if (values === undefined) return [];
	if (!Array.isArray(values)) {
		throw worldDeltaError('INVALID_WORLD_DELTA', 'left must be an array.');
	}
	return values.map(value => requiredId(value));
}

function normalizedEntity(value, fallbackType = null) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw worldDeltaError('INVALID_WORLD_ENTITY', 'World entities must be objects.');
	}
	const entity = clone(value);
	entity.id = requiredId(entity.id);
	entity.entityType = entityType(entity, fallbackType);
	return entity;
}

function upsertEntity(players, npcs, creatures, entity) {
	const stores = { creature: creatures, npc: npcs, player: players };
	const own = stores[entity.entityType] || players;
	own.set(entity.id, entity);
	for (const store of Object.values(stores)) {
		if (store !== own) store.delete(entity.id);
	}
}

function entityType(entity, fallbackType) {
	if (
		entity.entityType === 'npc'
		|| entity.entityType === 'player'
		|| entity.entityType === 'creature'
	) {
		return entity.entityType;
	}
	if (fallbackType) return fallbackType;
	if (!entity.kind && entity.role) return 'npc';
	return 'player';
}

function stripEntityType(entity) {
	const copy = clone(entity);
	delete copy.entityType;
	return copy;
}

function validRevision(value, label) {
	const revision = Number(value);
	if (!Number.isSafeInteger(revision) || revision < 0) {
		throw worldDeltaError('INVALID_WORLD_REVISION', `${label} revision is invalid.`);
	}
	return revision;
}

function requiredId(value) {
	const id = String(value || '').trim();
	if (!id) throw worldDeltaError('INVALID_WORLD_ENTITY_ID', 'A world entity ID is required.');
	return id.slice(0, 160);
}

function worldDeltaError(code, message) {
	return Object.assign(new Error(message), { code });
}

function clone(value) {
	return structuredClone(value);
}
