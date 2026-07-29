// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AdventureQuestService.js
 * @description Advances personal missions through solo or current-party authoritative events.
 * The Awtsmoos joins objective progress without merging reward identity; Awtsmoos.com keeps
 * each player’s completion time, wallet, XP, mitzvah points, and replay-safe reward separate.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { advanceAdventureEvent } = require('./AdventureQuestEventProgress.js');
const { grantReward } = require('./Progression.js');
const {
	ADVENTURE_QUESTS,
	adventureQuestDefinition
} = require('./AdventureQuestCatalog.js');

class AdventureQuestService {
	constructor(options = {}) {
		this.clock = options.clock || Date.now;
		this.membersFor = options.membersFor || (player => [player]);
	}
	list() {
		return clone(ADVENTURE_QUESTS);
	}
	start(player, questId) {
		const definition = this.requireDefinition(questId);
		const existing = player.adventureQuests[questId];
		if (existing?.status === 'active') return this.snapshot(player, questId);
		if (existing?.status === 'complete') {
			throw new RealtimeError(
				'ADVENTURE_ALREADY_COMPLETE',
				'That adventure is already complete.'
			);
		}
		player.adventureQuests[questId] = {
			count: 0,
			evidence: [],
			objectiveIndex: 0,
			status: 'active'
		};
		return this.snapshot(player, definition.id);
	}
	recordEvent(player, event) {
		return uniquePlayers(this.membersFor(player)).flatMap(recipient => {
			return advanceAdventureEvent(this, recipient, event);
		});
	}
	advanceObjective(player, quest, progress) {
		progress.objectiveIndex += 1;
		progress.count = 0;
		if (progress.objectiveIndex < quest.objectives.length) return;
		progress.status = 'complete';
		progress.completedAt = this.clock();
		progress.rewardGranted = grantReward(
			player.progression,
			quest.reward,
			{
				shliach: player.shliach,
				wallet: player.wallet
			}
		);
	}
	snapshot(player, questId = null) {
		if (questId) {
			const definition = this.requireDefinition(questId);
			return clone({
				definition,
				progress: player.adventureQuests[questId] || null
			});
		}
		return clone({
			definitions: ADVENTURE_QUESTS,
			progress: player.adventureQuests
		});
	}
	requireDefinition(questId) {
		const definition = adventureQuestDefinition(questId);
		if (!definition) {
			throw new RealtimeError(
				'ADVENTURE_NOT_FOUND',
				'The requested adventure does not exist.'
			);
		}
		return definition;
	}
}

function uniquePlayers(players = []) {
	return [...new Map(players.filter(Boolean).map(player => [player.id, player])).values()];
}
function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	AdventureQuestService
};
