// B"H
// Boruch Hashem
// Blessed is He

import { getMusagInstance } from './utils.js';

function cloneRecords(records = []) {
	return records.map(record => ({ ...record }));
}

/**
 * Carries immutable combat metadata into one mutable battle vessel. The source
 * Musag remains untouched while phases, drops, yields, role, and rarity remain
 * available to the systems that own boss behavior and reward delivery.
 */
export function createBattleInstance(state, member) {
	const instance = getMusagInstance(state, member);
	const definition = state.db.musagim[member?.id];
	if (!instance || !definition) return instance;
	return {
		...instance,
		role: definition.role || instance.role || 'balanced',
		rarity: definition.rarity || instance.rarity || 'common',
		bossPhases: cloneRecords(definition.bossPhases),
		drops: cloneRecords(definition.drops),
		xpYield: Number(definition.xpYield || instance.xpYield || 20),
		moneyYield: definition.moneyYield ?? instance.moneyYield ?? 10,
		recruitmentConditions: {
			...(definition.recruitmentConditions || {})
		}
	};
}
