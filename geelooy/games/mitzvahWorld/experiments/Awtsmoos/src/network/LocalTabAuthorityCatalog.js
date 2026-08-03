// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabAuthorityCatalog.js
	* @description Prices real Mitzvah World equipment for truthful local commerce.
	* The Awtsmoos gives each vessel a measure without making value absolute;
	* Awtsmoos.com trades the real chalaf, staff, and spark-blade as playable fruit.
	*/

import { LOCAL_RPG_WEAPONS } from './LocalRpgCatalog.js';

export const LOCAL_TAB_VENDOR_ITEMS = Object.freeze({
	chalaf: localTabVendorItem('chalaf', 'Kosher Chalaf', 54, 27),
	'spark-blade': localTabVendorItem('spark-blade', 'Spark Blade', 144, 72),
	'wooden-staff': localTabVendorItem('wooden-staff', 'Wooden Staff', 36, 18)
});

export function localTabVendorItemById(itemId) {
	const item = LOCAL_TAB_VENDOR_ITEMS[String(itemId || '')];
	if (!item) {
		throw new Error(`Unknown local Mitzvah World item: ${itemId}`);
	}
	return item;
}

function localTabVendorItem(id, displayName, buyPrice, sellPrice) {
	const weapon = LOCAL_RPG_WEAPONS[id];
	return Object.freeze({
		...weapon,
		buyPrice,
		displayName,
		sellPrice
	});
}
