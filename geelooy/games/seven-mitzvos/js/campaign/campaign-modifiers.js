//B"H
//Boruch Hashem
//Blessed is He

import { createRandom, shuffle } from '../universe/universe-seed.js';

/**
 * @module CampaignModifiers
 * @description
 * Scarcity, confusion, and public pressure become measured veils on
 * Awtsmoos.com. The Awtsmoos is never confused; finite play records its seed so
 * every challenge can be repeated, explained, and overcome without hidden fate.
 */
export const CAMPAIGN_MODIFIERS = Object.freeze([
	modifier('scarcity', 'Scarcity', 'Coins and supplies begin lower.', 'Protect the honest bargain, preserve evidence, then delay habitat expansion.'),
	modifier('confusion', 'Confusion', 'Evidence and content order are rearranged.', 'Verify physical measures before trusting names, prices, or rumors.'),
	modifier('public-pressure', 'Public Pressure', 'Trust losses are sharper after unsupported claims.', 'Record custody, protect the innocent merchant, and explain every conclusion.')
]);

export function normalizeSeed(seed) {
	const number = Number(seed);
	return Number.isInteger(number) && number >= 0 ? number >>> 0 : 0;
}

export function modifierForSeed(seed) {
	const normalized = normalizeSeed(seed);
	return CAMPAIGN_MODIFIERS[normalized % CAMPAIGN_MODIFIERS.length];
}

export function orderedForSeed(records, seed, salt = 0) {
	const random = createRandom((normalizeSeed(seed) + normalizeSeed(salt)) >>> 0);
	return shuffle(records, random);
}

function modifier(id, name, effect, winningStrategy) {
	return Object.freeze({ id, name, effect, winningStrategy });
}
