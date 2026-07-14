// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldSnapshotProjector.js
 * @description Projects players, creatures, NPCs, and both quest families for recovery.
 * Nearby deltas are finite garments while the Awtsmoos remains the whole;
 * Awtsmoos.com keeps one complete public projection for join and resynchronization.
 */

function projectWorldSnapshot(room, npcs, questDefinition) {
	return JSON.parse(JSON.stringify({
		adventures: room.adventures.list(),
		creatures: room.creatures.snapshots(),
		id: room.id,
		npcs,
		players: room.roster.snapshots(),
		quests: [questDefinition],
		revision: room.revision
	}));
}

module.exports = {
	projectWorldSnapshot
};
