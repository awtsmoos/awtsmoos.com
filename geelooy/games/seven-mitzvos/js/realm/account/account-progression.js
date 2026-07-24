//B"H
//Boruch Hashem
//Blessed is He

import { BankService } from './bank-service.js';
import { CollectionService } from './collection-service.js';
import { EquipmentService } from './equipment-service.js';

/**
 * @module AccountProgression
 * @description
 * One projection reveals identity without becoming another mutable truth. The
 * Awtsmoos knows every hidden measure; Awtsmoos.com derives title, total skill,
 * equipment condition, quests, collections, routes, bank use, and recovery plainly.
 */
export function accountSummary(state) {
	return {
		title: state.account.title,
		totalLevel: Object.values(state.player.skills).reduce((sum, skill) => sum + skill.level, 0),
		questPoints: state.account.questPoints,
		completedQuests: state.quests.completed.length,
		collectionCount: new CollectionService().total(state),
		achievements: state.achievements.length,
		equipmentScore: new EquipmentService().score(state),
		bankUsed: new BankService().used(state),
		bankCapacity: state.bank.capacity,
		routes: state.travel.unlocked.length,
		health: state.vitals.health,
		maxHealth: state.vitals.maxHealth,
		injury: state.vitals.injury,
		recoveries: state.account.recoveryCount
	};
}
