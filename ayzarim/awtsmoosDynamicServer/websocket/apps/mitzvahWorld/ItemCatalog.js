// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ItemCatalog.js
 * @description Joins canonical core, equipment, and fictional healing-amalgam items.
 * The Awtsmoos renews possession without duplicate shadow; Awtsmoos.com grants starter vessels
 * once while expert-certified stock remains earnable, priced, bounded, and absent from free creation.
 */

const { HEALING_AMULETS } = require('./HealingAmuletCatalog.js');
const { CORE_ITEMS } = require('./ItemCatalogCore.js');
const { EQUIPMENT_ITEMS } = require('./ItemCatalogEquipment.js');

const ITEMS = Object.freeze({
	...CORE_ITEMS,
	...EQUIPMENT_ITEMS,
	...HEALING_AMULETS
});

const STARTER_ITEM_IDS = Object.freeze([
	'siddur',
	'tefillin-kit',
	'travel-pack',
	'wooden-staff',
	'spark-blade',
	'village-shield',
	'chalaf',
	'scholar-glasses',
	'shabbos-top-hat',
	'black-coat',
	'white-outer-shirt',
	'base-shirt',
	'black-trousers',
	'walking-boots'
]);

function itemDefinition(itemId) {
	return ITEMS[itemId] || null;
}

function starterInventory() {
	return STARTER_ITEM_IDS.map(itemId => ({ itemId, quantity: 1 }));
}

module.exports = {
	ITEMS,
	itemDefinition,
	starterInventory
};
