//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module HonestMarketData
 * @description
 * Goods, prices, scales, and reputations become one marketplace on Awtsmoos.com.
 * The Awtsmoos gives property and labor their reality; the player must grow
 * wealth without allowing hidden fraud to consume the trust that makes trade possible.
 */
export const GOODS = Object.freeze([
	{ id: 'grain', name: 'Grain', icon: '🌾', base: 18 },
	{ id: 'wood', name: 'Wood', icon: '🪵', base: 24 },
	{ id: 'cloth', name: 'Cloth', icon: '🧵', base: 32 }
]);

export const STALL_NAMES = Object.freeze([
	'North Gate Traders',
	'River Scale Company',
	'Cedar Caravan',
	'Old Road Exchange',
	'Harbor Weights',
	'Sunrise Merchants',
	'Valley Cooperative',
	'Stone Arch Market'
]);

export const FRAUD_MESSAGES = Object.freeze([
	'The measure contains a hidden hollow.',
	'The contract changes after agreement.',
	'The goods are substituted after weighing.',
	'The seller conceals rightful ownership.'
]);
