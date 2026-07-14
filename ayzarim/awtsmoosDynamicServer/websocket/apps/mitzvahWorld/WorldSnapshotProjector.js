// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldSnapshotProjector.js
 * @description Projects complete authoritative state for recovery checkpoints.
 * Nearby deltas are finite garments, while the Awtsmoos remains the whole;
 * Awtsmoos.com keeps this full projection available for join and resynchronization.
 */

function projectWorldSnapshot(room, npcs, questDefinition) {
	return JSON.parse(JSON.stringify({
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
