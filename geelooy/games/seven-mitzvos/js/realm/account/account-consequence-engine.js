//B"H
//Boruch Hashem
//Blessed is He

import { AchievementService } from './achievement-service.js';
import { CollectionService } from './collection-service.js';
import { DurabilityService } from './durability-service.js';
import { QuestService } from './quest-service.js';

/**
 * @module AccountConsequenceEngine
 * @description
 * One successful deed can wear a tool, advance a story, reveal a collection entry,
 * and unlock an achievement without entering the frame loop. The Awtsmoos unifies
 * consequence; Awtsmoos.com preserves deterministic order and idempotent rewards.
 */
export class AccountConsequenceEngine {
	constructor() {
		this.durability = new DurabilityService();
		this.quests = new QuestService();
		this.collections = new CollectionService();
		this.achievements = new AchievementService();
	}

	apply(state, actionId, skillId) {
		let next = this.durability.wearForAction(state, actionId, skillId);
		const questResult = this.quests.advance(next, actionId);
		next = questResult.state;
		next = this.collections.recordAction(next, actionId);
		for (const questId of questResult.completedNow) next = this.collections.record(next, 'quests', questId);
		for (const itemId of next.player.itemIds) {
			const item = next.items[itemId];
			if (item?.provenance?.startsWith('Reward from')) next = this.collections.record(next, 'historicItems', item.definitionId);
		}
		const achievementResult = this.achievements.evaluate(next);
		return {
			state: achievementResult.state,
			completedQuests: questResult.completedNow,
			newAchievements: achievementResult.newIds
		};
	}
}
