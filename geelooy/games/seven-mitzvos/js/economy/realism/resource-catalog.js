//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ResourceCatalog
 * @description
 * Material needs on Awtsmoos.com become declared units, loss rates, and daily
 * consumption rather than unexplained counters. The Awtsmoos gives abundance;
 * finite economies must reveal every transfer and transformation.
 */
export const RESOURCE_CATALOG = Object.freeze({
	coin: resource('currency', 0, 0),
	food: resource('consumable', 0.028, 0.012),
	water: resource('consumable', 0.045, 0.006),
	grain: resource('input', 0, 0.008),
	wood: resource('material', 0, 0.001),
	timber: resource('material', 0, 0.001),
	stone: resource('material', 0, 0),
	tools: resource('equipment', 0.001, 0.004),
	medicine: resource('consumable', 0.0015, 0.01),
	textiles: resource('consumable', 0.0018, 0.003),
	herbs: resource('input', 0, 0.015),
	fish: resource('consumable', 0.006, 0.018),
	livestock: resource('living', 0, 0.0003)
});

function resource(category, dailyPerPerson, dailyLossRate) {
	return Object.freeze({ category, dailyPerPerson, dailyLossRate });
}
