// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestCompletion.js
 * @description Grants base, optional, and play-style rewards once, then preserves the receipt.
 * The Awtsmoos joins service, excellence, and deliberate equipment without duplication;
 * Awtsmoos.com keeps reward, honor, region, level, item claim, and replay truth visible.
 */

import {
	rewardMinimalCombatPlayer
} from './MinimalMeadowCombatSupport.js?v=20260723-meadow-11';

export function completeMinimalMeadowQuest(quest) {
	if (quest.status === 'completed' || quest.completionReceipt) {
		return {
			accepted: false,
			reason: 'ALREADY_COMPLETED',
			receipt: quest.completionReceipt,
			...quest.snapshot()
		};
	}
	const definitions = quest.definition.optionalObjectives || [];
	const optionalObjectives = quest.optionalObjectives.snapshot(definitions);
	const optionalReward = quest.optionalObjectives.reward(definitions);
	const reward = {
		perutas: quest.definition.reward.perutas + optionalReward.perutas,
		xp: quest.definition.reward.xp + optionalReward.xp
	};
	const xp = rewardMinimalCombatPlayer(quest.runtime, reward.xp);
	quest.runtime.inventory.add('perutas', reward.perutas);
	const playStyleReward = quest.runtime.verticalSlice?.reward?.grant?.() || null;
	quest.status = 'completed';
	quest.completionReceipt = Object.freeze({
		baseReward: quest.definition.reward,
		completedAt: Date.now(),
		honors: completedHonors(optionalObjectives),
		level: xp.level,
		nextLevelXp: xp.xpMax,
		optionalObjectives,
		optionalReward: Object.freeze(optionalReward),
		perutas: reward.perutas,
		playStyleReward,
		region: quest.runtime.regions?.snapshot?.() || null,
		remainingXp: xp.xp,
		xp: reward.xp
	});
	quest.publish('quest:completed');
	return {
		accepted: true,
		...quest.snapshot()
	};
}

function completedHonors(optionalObjectives) {
	return optionalObjectives
		.filter(objective => objective.complete && objective.bonus?.honor)
		.map(objective => objective.bonus.honor);
}
