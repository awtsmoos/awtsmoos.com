// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldScopedSnapshot.js
 * @description Projects recovery snapshots through interest limits and observer-specific Daas insight.
 * The Awtsmoos remains the whole while one traveler beholds a lawful nearby garment;
 * Awtsmoos.com preserves scope, truncation, and earned combat insight without private leakage.
 */

const { observerEnemyActionSnapshot } = require('./EnemyActionPresentation.js');
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
		.sort(recordOrder);
	const visible = records.slice(0, room.interest.maximumEntities);
	const selected = selectedIds(visible);
	return clone({
		...world,
		creatures: scopedCreatures(room, world.creatures, selected.creatures, observer),
		interest: interestSnapshot(room, observer, visible, records),
		npcs: world.npcs.filter(entity => selected.npcs.has(entity.id)),
		players: world.players.filter(entity => selected.players.has(entity.id))
	});
}

function scopedCreatures(room, creatures, selected, observer) {
	return creatures
		.filter(entity => selected.has(entity.id))
		.map(entity => {
			const authoritative = room.creatures.get(entity.id);
			return {
				...entity,
				action: observerEnemyActionSnapshot(authoritative, observer)
			};
		});
}

function interestSnapshot(room, observer, visible, records) {
	return {
		cell: cellFor(observer.position, room.interest.cellSize),
		maximumEntities: room.interest.maximumEntities,
		radius: room.interest.radius,
		truncated: visible.length < records.length,
		visibleEntities: visible.length
	};
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

function recordOrder(left, right) {
	return Number(right.self) - Number(left.self) || left.distance - right.distance;
}

function distance(left = {}, right = {}) {
	return Math.hypot(
		Number(left.x || 0) - Number(right.x || 0),
		Number(left.z || 0) - Number(right.z || 0)
	);
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = { projectScopedWorldSnapshot };
