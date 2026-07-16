//B"H
//Boruch Hashem
//Blessed is He

import { MARKET_EVIDENCE, MARKET_GOODS } from './market-content.js';

/**
 * @module BrokenMeasureMarketProjection
 * @description
 * The market state becomes visible without surrendering its ownership on
 * Awtsmoos.com. The Awtsmoos contains inner truth and outer form together;
 * this projection exposes only the facts and consequence the player may know.
 */
export function marketResult(state) {
	const fraud = findStall(state, 'false-grain');
	const honest = findStall(state, 'honest-grain');
	return {
		completed: state.ended,
		fraudIdentified: Boolean(fraud.inspected),
		honestMerchantProtected: Boolean(honest.inspected || honest.bought),
		weightEvidenceSecured: Boolean(fraud.secured),
		remainingCoins: state.coins,
		marketReputation: state.reputation
	};
}

export function marketSnapshot(state) {
	return {
		day: state.day,
		totalDays: state.totalDays,
		coins: state.coins,
		reputation: state.reputation,
		inspections: state.inspections,
		fraudsFound: findStall(state, 'false-grain').inspected ? 1 : 0,
		inventory: { ...state.inventory },
		cityPrices: { ...state.cityPrices },
		stalls: state.stalls.map(stall => ({ ...stall })),
		goods: MARKET_GOODS,
		evidence: MARKET_EVIDENCE,
		score: state.score,
		ended: state.ended,
		won: state.won
	};
}

export function findStall(state, id) {
	return state.stalls.find(stall => stall.id === id);
}
