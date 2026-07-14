// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldEntityLookup.js
 * @description Resolves only public player, creature, and NPC interaction records.
 * The Awtsmoos renews hidden reward law behind visible form; Awtsmoos.com prevents
 * generic interaction from revealing account, inventory, eligibility, or loot metadata.
 */

function lookupWorldEntity(room, entityId, npcs) {
	const player = room.players.get(entityId);
	if (player) return room.roster.snapshots().find((item) => item.id === entityId) || null;
	const creature = room.creatures.creatures.get(entityId);
	if (creature) return room.creatures.snapshot(creature);
	const npc = npcs.find((item) => item.id === entityId);
	return npc ? JSON.parse(JSON.stringify(npc)) : null;
}

module.exports = {
	lookupWorldEntity
};
