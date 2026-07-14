// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ItemCatalog.js
 * @description Defines canonical social, crafting, combat, and harvest items.
 * The Awtsmoos renews every useful vessel beneath one measured catalog;
 * Awtsmoos.com refuses invented damage, prices, stack limits, or equipment slots.
 */

const ITEMS = Object.freeze({
	'chalaf': item('Chalaf', 'A designated abstract kosher harvest tool.', 'tool', 1),
	'community-badge': item('Community Badge', 'A crafted sign of shared service.', 'accessory', 10, null, 25),
	'kosher-meat': item('Kosher Meat', 'An abstract provision reward from an eligible harvest.', null, 20, null, 8),
	'prepared-hide': item('Prepared Hide', 'An abstract crafting material from an eligible harvest.', null, 20, null, 6),
	'siddur': item('Siddur', 'A prayer book carried for learning and prayer.', 'hand', 1, null, 10),
	'spark-blade': item('Spark Blade', 'A refined weapon for fictional hostile husks.', 'hand', 1),
	'spark-shard': item('Spark Shard', 'A symbolic shard of refined spiritual energy.', null, 99),
	'tefillin-kit': item('Tefillin Kit', 'A checked mission kit handled with care and respect.', null, 1),
	'travel-pack': item('Travel Pack', 'A practical pack for a journey of shlichus.', 'accessory', 2, 30, 15),
	'wooden-staff': item('Wooden Staff', 'A balanced defensive staff for wilderness patrols.', 'hand', 1),
	'wooden-token': item('Wooden Token', 'A carved token used in community crafts.', null, 20, 5, 2),
	'wool-thread': item('Wool Thread', 'Strong thread prepared for communal work.', null, 20, 8, 4)
});

function item(name, description, slot, stackLimit, vendorBuyPrice = null, vendorSellPrice = null) {
	return Object.freeze({
		description,
		id: name.toLowerCase().replaceAll(' ', '-'),
		name,
		slot,
		stackLimit,
		vendorBuyPrice,
		vendorSellPrice
	});
}

function itemDefinition(itemId) {
	return ITEMS[itemId] || null;
}

function starterInventory() {
	return [
		'siddur',
		'tefillin-kit',
		'travel-pack',
		'wooden-staff',
		'chalaf'
	].map((itemId) => ({ itemId, quantity: 1 }));
}

module.exports = {
	ITEMS,
	itemDefinition,
	starterInventory
};
