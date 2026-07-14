// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldRoomComposition.js
 * @description Composes focused authoritative services for one world room.
 * The Awtsmoos renews many powers within one world; this Awtsmoos.com factory
 * reveals each service separately while the room remains their coordinating vessel.
 */

const { InstanceDirectory } = require('./InstanceDirectory.js');
const { InventoryService } = require('./InventoryService.js');
const { PartyDirectory } = require('./PartyDirectory.js');
const { PlayerActionService } = require('./PlayerActionService.js');
const { QuestControlService } = require('./QuestControlService.js');
const { WorldActivityService } = require('./WorldActivityService.js');
const { WorldBotRoster } = require('./WorldBotRoster.js');
const { WorldEventJournal } = require('./WorldEventJournal.js');
const { WorldInterestIndex } = require('./WorldInterestIndex.js');
const { WorldPlayerRoster } = require('./WorldPlayerRoster.js');

function createWorldRoomComposition(room, options = {}) {
	const roster = new WorldPlayerRoster(prefix => room.entityId(prefix));
	const players = roster.players;
	const journal = new WorldEventJournal(options.eventLimit);
	const bots = new WorldBotRoster(players, prefix => room.entityId(prefix));
	return {
		activity: new WorldActivityService(
			roster,
			bots,
			(type, payload) => room.record(type, payload)
		),
		bots,
		instances: new InstanceDirectory(players),
		interest: new WorldInterestIndex(options),
		inventory: new InventoryService(),
		journal,
		parties: new PartyDirectory(players),
		playerActions: new PlayerActionService(room),
		players,
		questControl: new QuestControlService(),
		roster
	};
}

module.exports = {
	createWorldRoomComposition
};
