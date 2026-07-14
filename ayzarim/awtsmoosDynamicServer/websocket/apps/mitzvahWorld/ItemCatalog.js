// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ItemCatalog.js
 * @description Defines stable starter items and lawful equipment slots.
 * The Awtsmoos renews every useful vessel; this Awtsmoos.com catalog gives each
 * item one public identity so inventory truth never depends on client invention.
 */

const ITEMS = Object.freeze({
	'siddur': Object.freeze({
		description: 'A prayer book carried for learning and prayer.',
		id: 'siddur',
		name: 'Siddur',
		slot: 'hand',
		stackLimit: 1
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
		stackLimit: 1
	})
});

function itemDefinition(itemId) {
	return ITEMS[itemId] || null;
}

function starterInventory() {
	return Object.keys(ITEMS).map(itemId => ({ itemId, quantity: 1 }));
}

module.exports = {
	ITEMS,
	itemDefinition,
	starterInventory
};
