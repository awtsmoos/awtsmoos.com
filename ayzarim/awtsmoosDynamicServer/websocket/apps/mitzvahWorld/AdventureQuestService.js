// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AdventureQuestService.js
 * @description Advances event-driven missions and grants exact-once complete rewards.
 * The Awtsmoos renews every objective as a measured step toward repair; Awtsmoos.com
 * joins XP, mitzvah points, level attributes, and Perutas beneath one replay-safe id.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const {
	matchesAdventureObjective
} = require('./AdventureObjectiveRules.js');
const { grantReward } = require('./Progression.js');
const {
	ADVENTURE_QUESTS,
	adventureQuestDefinition
} = require('./AdventureQuestCatalog.js');

class AdventureQuestService {
	constructor(options = {}) {
		this.clock = options.clock || Date.now;
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
			objectiveIndex: 0,
			status: 'active'
		};
		return this.snapshot(player, definition.id);
	}

	recordEvent(player, event) {
		const advanced = [];
		for (const quest of ADVENTURE_QUESTS) {
			const progress = player.adventureQuests[quest.id];
			if (!progress || progress.status !== 'active') continue;
			const objective = quest.objectives[progress.objectiveIndex];
			if (!matchesAdventureObjective(objective, event)) continue;
			progress.count = Math.min(
				objective.count,
				progress.count + Number(event.count || 1)
			);
			if (progress.count >= objective.count) {
				this.advanceObjective(player, quest, progress);
			}
			advanced.push(this.snapshot(player, quest.id));
		}
		return advanced;
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

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	AdventureQuestService
};
