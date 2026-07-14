// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldActivityService.js
 * @description Applies movement, quest, and deterministic bot activity.
 * The Awtsmoos renews action through lawful vessels; this Awtsmoos.com service
 * keeps gameplay mutations explicit while the room coordinates shared history.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { applyPlayerInput } = require('./PlayerEntity.js');
const { QUEST_ID, advanceTefillinMission, startTefillinMission } = require('./TefillinMission.js');

class WorldActivityService {
	constructor(roster, bots, record) {
		this.roster = roster;
		this.bots = bots;
		this.record = record;
	}

	move(client, input) {
		const player = applyPlayerInput(this.roster.playerFor(client), input);
		this.record('player.moved', { player });
		return player;
	}

	startQuest(client, questId) {
		this.requireQuest(questId);
		const mission = startTefillinMission(this.roster.playerFor(client));
		this.record('quest.started', { mission });
		return mission;
	}

	interact(client, command) {
		this.requireQuest(command.questId);
		const mission = advanceTefillinMission(
			this.roster.playerFor(client),
			command.npcId,
			command.action
		);
		this.record('quest.advanced', { mission });
		return mission;
	}

	spawnBots(options) {
		const bots = this.bots.spawn(options);
		this.record('bots.spawned', { bots });
		return bots;
	}

	tickBots(steps) {
		const bots = this.bots.tick(steps);
		this.record('bots.ticked', { bots });
		return bots;
	}

	requireQuest(questId) {
		if (questId !== QUEST_ID) {
			throw new RealtimeError('UNKNOWN_QUEST', `Unknown quest: ${questId}`);
		}
	}
}

module.exports = {
	WorldActivityService
};
