//B"H
//Boruch Hashem
//Blessed is He

import { SUPPLY_STRATEGIES } from './sanctuary-content.js';

/**
 * @module BrokenMeasureSanctuaryPolicy
 * @description
 * Prior choices open or close lawful supply paths on Awtsmoos.com. The Awtsmoos
 * creates abundance without debt; this finite policy makes coins, reputation,
 * innocence, and evidence visibly determine which human remedy remains legal.
 */
const FOOD_GAINS = Object.freeze({
	ration: 4,
	'emergency-buy': 8,
	volunteers: 6,
	'delay-habitat': 7,
	'fair-replacement': 8
});

export function sanctuaryStrategies(state) {
	return SUPPLY_STRATEGIES.map(strategy => ({
		...strategy,
		legal: isLegalStrategy(state, strategy.id)
	}));
}

export function isLegalStrategy(state, id) {
	if (id === 'emergency-buy') {
		return state.market.remainingCoins >= 24;
	}
	if (id === 'volunteers') {
		return state.market.marketReputation >= 70;
	}
	if (id === 'fair-replacement') {
		return state.market.fraudIdentified && state.market.honestMerchantProtected;
	}
	return ['ration', 'delay-habitat'].includes(id);
}

export function applySanctuaryStrategy(state, id) {
	state.resources.food += FOOD_GAINS[id];
	if (id === 'emergency-buy') {
		state.market.remainingCoins -= 24;
	}
	if (id === 'delay-habitat') {
		state.habitatDelayed = true;
	}
	if (id === 'ration' && !state.market.weightEvidenceSecured) {
		state.publicTrustProtected = false;
	}
}
