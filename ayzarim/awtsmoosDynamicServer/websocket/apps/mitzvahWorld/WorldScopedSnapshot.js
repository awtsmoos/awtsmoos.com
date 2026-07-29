// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldScopedSnapshot.js
 * @description Projects full recovery snapshots through the room's interest radius and cap.
 * The Awtsmoos remains the whole world while one traveler beholds a lawful nearby garment;
 * Awtsmoos.com preserves self, revision, adventures, quests, effects, and truncation evidence.
 */

const { cellFor, isVisible } = require('./SpatialCell.js');

function projectScopedWorldSnapshot(room, client) {
	const world = room.snapshot();
	const observer = room.playerFor(client);
	const records = entityRecords(world, observer)
		.filter(record => record.self || isVisible(
			observer.position,
			record.entity.position,
			room.interest.radius
		))
		.sort((left, right) => Number(right.self) - Number(left.self) || left.distance - right.distance);
	const visible = records.slice(0, room.interest.maximumEntities);
	const selected = selectedIds(visible);
	return JSON.parse(JSON.stringify({
		...world,
		creatures: world.creatures.filter(entity => selected.creatures.has(entity.id)),
		interest: {
			cell: cellFor(observer.position, room.interest.cellSize),
			maximumEntities: room.interest.maximumEntities,
			radius: room.interest.radius,
			truncated: visible.length < records.length,
			visibleEntities: visible.length
		},
		npcs: world.npcs.filter(entity => selected.npcs.has(entity.id)),
		players: world.players.filter(entity => selected.players.has(entity.id))
	}));
}

function entityRecords(world, observer) {
	return [
		...recordsFor(world.players, 'players', observer),
		...recordsFor(world.creatures, 'creatures', observer),
		...recordsFor(world.npcs, 'npcs', observer)
	];
}

function recordsFor(entities, kind, observer) {
	return entities.map(entity => ({
		distance: distance(observer.position, entity.position),
		entity,
		kind,
		self: kind === 'players' && entity.id === observer.id
	}));
}

function selectedIds(records) {
	const selected = {
		creatures: new Set(),
		npcs: new Set(),
		players: new Set()
	};
	for (const record of records) selected[record.kind].add(record.entity.id);
	return selected;
}

function distance(left = {}, right = {}) {
	return Math.hypot(
		Number(left.x || 0) - Number(right.x || 0),
		Number(left.z || 0) - Number(right.z || 0)
	);
}

module.exports = { projectScopedWorldSnapshot };
