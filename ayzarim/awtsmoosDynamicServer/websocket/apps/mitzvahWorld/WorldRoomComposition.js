// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldRoomComposition.js
 * @description Composes movement, combat, expansion, social, and economy domain owners.
 * The Awtsmoos renews many powers within one world; Awtsmoos.com gives each domain a vessel
 * while one player map, clock, inventory, party, effect directory, and journal preserve truth.
 */

const { AdventureQuestService } = require('./AdventureQuestService.js');
const { AnimalHarvestService } = require('./AnimalHarvestService.js');
const { CombatService } = require('./CombatService.js');
const { CorpseLootService } = require('./CorpseLootService.js');
const { CraftingService } = require('./CraftingService.js');
const { CreatureDirectory } = require('./CreatureDirectory.js');
const { EconomyService } = require('./EconomyService.js');
const { GuildDirectory } = require('./GuildDirectory.js');
const { InstanceDirectory } = require('./InstanceDirectory.js');
const { InventoryService } = require('./InventoryService.js');
const { MailService } = require('./MailService.js');
const { PartyDirectory } = require('./PartyDirectory.js');
const { partyMembers } = require('./PartyMemberResolver.js');
const { PlayerActionService } = require('./PlayerActionService.js');
const { QuestControlService } = require('./QuestControlService.js');
const { RiverCrossingService } = require('./RiverCrossingService.js');
const { ShliachProfileService } = require('./ShliachProfileService.js');
const { TradeDirectory } = require('./TradeDirectory.js');
const { WorldActivityService } = require('./WorldActivityService.js');
const { WorldBotRoster } = require('./WorldBotRoster.js');
const { WorldEffectDirectory } = require('./WorldEffectDirectory.js');
const { WorldEventJournal } = require('./WorldEventJournal.js');
const { WorldExpansionService } = require('./WorldExpansionService.js');
const { WorldInterestIndex } = require('./WorldInterestIndex.js');
const { WorldPlayerRoster } = require('./WorldPlayerRoster.js');

function createWorldRoomComposition(room, options = {}) {
	const clock = options.clock || Date.now;
	const roster = new WorldPlayerRoster(prefix => room.entityId(prefix));
	const players = roster.players;
	const inventory = new InventoryService();
	const parties = new PartyDirectory(players);
	const membersFor = actor => partyMembers(parties, players, actor);
	const adventures = new AdventureQuestService({ clock, membersFor });
	const creatures = new CreatureDirectory(players, { clock });
	const expansion = new WorldExpansionService({ clock });
	const effects = new WorldEffectDirectory({ clock });
	const bots = new WorldBotRoster(
		players,
		prefix => room.entityId(prefix)
	);
	const combat = new CombatService({
		adventures,
		clock,
		creatures,
		expansion,
		inventory,
		players
	});
	return {
		activity: new WorldActivityService(
			roster,
			bots,
			(type, payload) => room.record(type, payload)
		),
		adventures,
		bots,
		combat,
		crafting: new CraftingService(inventory),
		creatures,
		economy: new EconomyService(inventory),
		expansion,
		guilds: new GuildDirectory(players),
		harvesting: new AnimalHarvestService({ adventures, creatures, inventory }),
		instances: new InstanceDirectory(players),
		interest: new WorldInterestIndex(options),
		inventory,
		journal: new WorldEventJournal(options.eventLimit),
		loot: new CorpseLootService({ adventures, clock, creatures, inventory }),
		mail: new MailService(players, clock),
		parties,
		playerActions: new PlayerActionService(room),
		players,
		profiles: new ShliachProfileService({ clock }),
		questControl: new QuestControlService(),
		riverCrossing: new RiverCrossingService({
			adventures,
			effects,
			inventory,
			membersFor
		}),
		roster,
		trades: new TradeDirectory(players, inventory),
		worldEffects: effects
	};
}

module.exports = {
	createWorldRoomComposition
};
