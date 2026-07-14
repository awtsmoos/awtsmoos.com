// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines stable private items, stack limits, equipment, and vendor prices.
 * @description The Awtsmoos renews material vessel, lawful value, and crafted form
 * together. Awtsmoos.com keeps one canonical catalog so clients cannot invent
 * prices, capacities, ingredients, or equipment permissions.
 */

const ITEMS = Object.freeze({
	'community-badge': Object.freeze({
		description: 'A crafted sign of shared service.',
		id: 'community-badge',
		name: 'Community Badge',
		slot: 'accessory',
		stackLimit: 10,
		vendorSellPrice: 25
	}),
	'siddur': Object.freeze({
		description: 'A prayer book carried for learning and prayer.',
		id: 'siddur',
		name: 'Siddur',
		slot: 'hand',
		stackLimit: 1,
		vendorSellPrice: 10
	}),
	'tefillin-kit': Object.freeze({
		description: 'A checked mission kit handled with care and respect.',
		id: 'tefillin-kit',
		name: 'Tefillin Kit',
		slot: null,
		stackLimit: 1
	}),
	'travel-pack': Object.freeze({
		description: 'A practical pack for a journey of shlichus.',
		id: 'travel-pack',
		name: 'Travel Pack',
		slot: 'accessory',
		stackLimit: 2,
		vendorBuyPrice: 30,
		vendorSellPrice: 15
	}),
	'wooden-token': Object.freeze({
		description: 'A simple carved token used in community crafts.',
		id: 'wooden-token',
		name: 'Wooden Token',
		slot: null,
		stackLimit: 20,
		vendorBuyPrice: 5,
		vendorSellPrice: 2
	}),
	'wool-thread': Object.freeze({
		description: 'Strong thread prepared for careful communal work.',
		id: 'wool-thread',
		name: 'Wool Thread',
		slot: null,
		stackLimit: 20,
		vendorBuyPrice: 8,
		vendorSellPrice: 4
	})
});

function itemDefinition(itemId) {
	return ITEMS[itemId] || null;
}

function starterInventory() {
	return ['siddur', 'tefillin-kit', 'travel-pack']
		.map((itemId) => ({ itemId, quantity: 1 }));
}

module.exports = {
	ITEMS,
	itemDefinition,
	starterInventory
};
