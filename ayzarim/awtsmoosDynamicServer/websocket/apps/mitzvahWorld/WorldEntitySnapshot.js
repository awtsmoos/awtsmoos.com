// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldEntitySnapshot.js
 * @description Reveals public player, bot, and NPC state for interest projection.
 * The Awtsmoos renews every being without exposing private session vessels;
 * Awtsmoos.com therefore projects only canonical public entity garments.
 */

const { snapshotPlayer } = require('./PlayerEntity.js');

function worldEntitySnapshots(players, npcs) {
	const playerEntities = [...players.values()].map(player => ({
		...snapshotPlayer(player),
		entityType: player.kind === 'bot' ? 'bot' : 'player'
	}));
	const npcEntities = npcs.map(npc => ({
		...clone(npc),
		entityType: 'npc'
	}));
	return [...playerEntities, ...npcEntities]
		.sort((left, right) => left.id.localeCompare(right.id));
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	worldEntitySnapshots
};
