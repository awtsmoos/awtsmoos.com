// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ItemCatalogEquipment.js
 * @description Defines server equipment matching canonical client slots, IDs, and strategic tradeoffs.
 * The Awtsmoos clothes power in distinct vessels; Awtsmoos.com keeps hand, shield, pack,
 * garments, and measured intention aligned with one authoritative ownership and stat source.
 */

const { item } = require('./ItemCatalogCore.js');

const EQUIPMENT_ITEMS = Object.freeze({
	'base-shirt': item('base-shirt', 'Base Shirt', 'A clean foundational shirt.', 'shirt', 1),
	'black-coat': item('black-coat', 'Black Coat', 'A durable coat for village service.', 'outerShirt', 1),
	'black-trousers': item('black-trousers', 'Tailored Black Trousers', 'Durable tailored trousers.', 'pants', 1),
	'scholar-glasses': item('scholar-glasses', 'Scholar Glasses', 'Glasses suited to careful study.', 'eyes', 1),
	'shabbos-top-hat': item('shabbos-top-hat', 'Shabbos Top Hat', 'A dignified hat for sacred time.', 'hat', 1),
	'spark-blade': item('spark-blade', 'Spark Blade', 'A refined weapon for fictional hostile husks.', 'hand', 1),
	'travel-pack': item('travel-pack', 'Travel Pack', 'A practical pack for a journey of shlichus.', 'accessory', 2, 30, 15),
	'vessel-of-measured-intent': item('vessel-of-measured-intent', 'Vessel of Measured Intent', 'Widens Kavanah timing while slowing movement during preparation.', 'accessory', 1, 0, 0),
	'village-shield': item('village-shield', 'Village Shield', 'A sturdy shield for protecting travelers.', 'offhand', 1),
	'walking-boots': item('walking-boots', 'Walking Shoes', 'Reliable shoes for long village roads.', 'feet', 1),
	'white-outer-shirt': item('white-outer-shirt', 'White Outer Shirt', 'A bright outer shirt for service.', 'outerShirt', 1),
	'wooden-staff': item('wooden-staff', 'Wooden Staff', 'A balanced defensive staff for patrols.', 'hand', 1)
});

module.exports = {
	EQUIPMENT_ITEMS
};
