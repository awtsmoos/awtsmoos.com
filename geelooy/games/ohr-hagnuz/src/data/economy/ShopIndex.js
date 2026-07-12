/**
 * B"H
 * @module ShopIndex
 * @description Honest shops with explicit buy and sell values.
 */
const item = (id, name, buy, sell, description, stock = null) => ({ id, name, buy, sell, description, stock });

export const ShopIndex = {
	village_general: {
		id: 'village_general',
		name: 'Village Provisions',
		keeper: 'Merchant נ',
		items: [
			item('tea', 'Warm Tea', 8, 4, 'Restores light between difficult encounters.'),
			item('ink', 'Scribe Ink', 12, 6, 'Used for books, maps, and crafted scrolls.'),
			item('balm', 'Healing Balm', 18, 9, 'A stronger healing vessel.', 6),
			item('scroll', 'Ordinary Scroll', 10, 5, 'Tradeable parchment without sacred ownership.')
		]
	},
	merchant_exchange: {
		id: 'merchant_exchange',
		name: 'Market of Exchange',
		keeper: 'Merchant נ',
		items: [
			item('tea', 'Travel Tea', 10, 4, 'Market-priced tea for the long road.'),
			item('ink', 'Jerusalem Ink', 14, 7, 'Fine ink with a traceable source.'),
			item('balm', 'Caravan Balm', 22, 11, 'Protects travelers during escort missions.'),
			item('fig', 'Ordinary Fig', 6, 3, 'Food, not Bikkurim; safe to trade.')
		]
	}
};

export const shopById = id => ShopIndex[id] || null;
