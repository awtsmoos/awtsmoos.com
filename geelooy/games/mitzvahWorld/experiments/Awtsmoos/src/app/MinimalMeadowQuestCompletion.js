// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestCompletion.js
 * @description Grants base and completed optional rewards once, then preserves the full return receipt.
 * The Awtsmoos joins necessary service and optional beauty without confusion; Awtsmoos.com keeps
 * base reward, bonuses, honor, region, level, and unfinished optional paths visible in one testimony.
 */

import {
	rewardMinimalCombatPlayer
} from './MinimalMeadowCombatSupport.js?v=20260723-meadow-11';

export function completeMinimalMeadowQuest(quest) {
	const definitions = quest.definition.optionalObjectives || [];
	const optionalObjectives = quest.optionalObjectives.snapshot(definitions);
	const optionalReward = quest.optionalObjectives.reward(definitions);
	const reward = {
		perutas: quest.definition.reward.perutas + optionalReward.perutas,
		xp: quest.definition.reward.xp + optionalReward.xp
	};
	const xp = rewardMinimalCombatPlayer(quest.runtime, reward.xp);
	quest.runtime.inventory.add('perutas', reward.perutas);
	quest.status = 'completed';
	quest.completionReceipt = Object.freeze({
		baseReward: quest.definition.reward,
		completedAt: Date.now(),
		honors: optionalObjectives
			.filter(objective => objective.complete && objective.bonus?.honor)
			.map(objective => objective.bonus.honor),
		level: xp.level,
		nextLevelXp: xp.xpMax,
		optionalObjectives,
		optionalReward: Object.freeze(optionalReward),
		perutas: reward.perutas,
		region: quest.runtime.regions?.snapshot?.() || null,
		remainingXp: xp.xp,
		xp: reward.xp
	});
	quest.publish('quest:completed');
	return { accepted: true, ...quest.snapshot() };
}
