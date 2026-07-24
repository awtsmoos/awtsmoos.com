//B"H
//Boruch Hashem
//Blessed is He

import { BankService } from './bank-service.js';
import { CollectionService } from './collection-service.js';

/**
 * @module AchievementService
 * @description
 * Achievements honor breadth, endurance, restoration, and remembered service. The
 * Awtsmoos is beyond rank; Awtsmoos.com refuses compulsive streaks and unlocks only
 * from real account state that can be inspected and repeated without duplication.
 */
const RULES = Object.freeze([
	['first-consequence', state => state.actionCount >= 1],
	['many-skilled-hands', state => Object.values(state.player.skills).filter(skill => skill.level >= 2).length >= 4],
	['bridge-helper', state => state.bridge.timber + state.bridge.stone >= 4],
	['world-listener', state => new CollectionService().total(state) >= 8],
	['quest-bearer', state => state.quests.completed.length >= 1],
	['well-equipped', state => Object.values(state.equipment).filter(Boolean).length >= 4],
	['careful-banker', state => new BankService().used(state) >= 5],
	['returned-from-danger', state => state.account.recoveryCount >= 1]
]);

export class AchievementService {
	evaluate(state) {
		const unlocked = [...state.achievements];
		const newIds = [];
		for (const [id, predicate] of RULES) {
			if (unlocked.includes(id) || !predicate(state)) continue;
			unlocked.push(id);
			newIds.push(id);
		}
		return { state: { ...state, achievements: unlocked }, newIds };
	}
}
