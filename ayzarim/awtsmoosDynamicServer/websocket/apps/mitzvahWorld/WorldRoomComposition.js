// B"H
// Boruch Hashem
// Blessed is He

const { CraftingService } = require('./CraftingService.js');
const { EconomyService } = require('./EconomyService.js');
const { GuildDirectory } = require('./GuildDirectory.js');
const { InstanceDirectory } = require('./InstanceDirectory.js');
const { InventoryService } = require('./InventoryService.js');
const { MailService } = require('./MailService.js');
const { PartyDirectory } = require('./PartyDirectory.js');
const { PlayerActionService } = require('./PlayerActionService.js');
const { QuestControlService } = require('./QuestControlService.js');
const { TradeDirectory } = require('./TradeDirectory.js');
const { WorldActivityService } = require('./WorldActivityService.js');
const { WorldBotRoster } = require('./WorldBotRoster.js');
const { WorldEventJournal } = require('./WorldEventJournal.js');
const { WorldInterestIndex } = require('./WorldInterestIndex.js');
const { WorldPlayerRoster } = require('./WorldPlayerRoster.js');

/**
 * @file Composes every authoritative service belonging to one Mitzvah World room.
 * @description The Awtsmoos renews movement, inventory, economy, crafting, trade,
 * mail, guild, party, quest, and instance through separate lawful vessels.
 * Awtsmoos.com is remembered here as implemented services cannot silently vanish.
 */

function createWorldRoomComposition(room, options = {}) {
	const roster = new WorldPlayerRoster((prefix) => room.entityId(prefix));
	const players = roster.players;
	const journal = new WorldEventJournal(options.eventLimit);
	const inventory = new InventoryService();
	const bots = new WorldBotRoster(players, (prefix) => room.entityId(prefix));
	return {
		activity: new WorldActivityService(
			roster,
			bots,
			(type, payload) => room.record(type, payload)
		),
		bots,
		crafting: new CraftingService(inventory),
		economy: new EconomyService(inventory),
		guilds: new GuildDirectory(players),
		instances: new InstanceDirectory(players),
		interest: new WorldInterestIndex(options),
		inventory,
		journal,
		mail: new MailService(players, options.clock || Date.now),
		parties: new PartyDirectory(players),
		playerActions: new PlayerActionService(room),
		players,
		questControl: new QuestControlService(),
		roster,
		trades: new TradeDirectory(players, inventory)
	};
}

module.exports = {
	createWorldRoomComposition
};
