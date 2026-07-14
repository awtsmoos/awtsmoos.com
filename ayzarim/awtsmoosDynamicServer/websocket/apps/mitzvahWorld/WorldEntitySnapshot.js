// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldEntitySnapshot.js
 * @description Reveals public player, bot, NPC, animal, and spirit state for interest.
 * The Awtsmoos renews every being without exposing private reward vessels;
 * Awtsmoos.com projects position, health, status, and identity needed for shared play.
 */

const { snapshotPlayer } = require('./PlayerEntity.js');

function worldEntitySnapshots(players, npcs, creatures = []) {
	const playerEntities = [...players.values()].map((player) => ({
		...snapshotPlayer(player),
		entityType: player.kind === 'bot' ? 'bot' : 'player'
	}));
	const npcEntities = npcs.map((npc) => ({
		...clone(npc),
		entityType: 'npc'
	}));
	const creatureEntities = creatures.map((creature) => ({
		...clone(creature),
		entityType: 'creature'
	}));
	return [...playerEntities, ...npcEntities, ...creatureEntities]
		.sort((left, right) => left.id.localeCompare(right.id));
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	worldEntitySnapshots
};
