// B"H
// Boruch Hashem
// Blessed is He

import * as Quests from '../quests.js';

export function battleMoneyAmount(opponent) {
	if (typeof opponent.moneyYield === 'number') return opponent.moneyYield;
	return Number(opponent.moneyYield?.perutah || 10);
}

/** Rolls each authored drop once after multipliers are applied. */
export function grantBattleDrops(state, sendToast) {
	for (const drop of state.battle.opponent.drops || []) {
		let chance = Number(drop.chance || 0);
		chance *= state.battle.gateEffects.dropMult || 1;
		if (Math.random() < chance) {
			Quests.giveItem(state, drop.itemId, 1, sendToast);
		}
	}
}
