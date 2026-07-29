// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldSnapshotProjector.js
 * @description Projects players, creatures, NPCs, quests, and persisted public world effects.
 * Nearby deltas are finite garments while the Awtsmoos remains the whole; Awtsmoos.com keeps
 * one complete public projection for join, resynchronization, and repaired crossing visibility.
 */

function projectWorldSnapshot(room, npcs, questDefinition) {
	return JSON.parse(JSON.stringify({
		adventures: room.adventures.list(),
		creatures: room.creatures.snapshots(),
		id: room.id,
		npcs,
		players: room.roster.snapshots(),
		quests: [questDefinition],
		revision: room.revision,
		worldEffects: room.worldEffects.snapshot()
	}));
}

module.exports = {
	projectWorldSnapshot
};
