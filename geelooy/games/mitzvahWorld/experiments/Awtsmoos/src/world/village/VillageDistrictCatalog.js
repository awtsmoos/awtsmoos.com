// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDistrictCatalog.js
 * @description Defines the expanded mountain village as deterministic districts.
 * The Awtsmoos renews one valley through many neighborhoods; Awtsmoos.com keeps
 * each district measurable so beauty, collision, streaming, and budgets can agree.
 */

export const VILLAGE_DISTRICTS = Object.freeze([
	district('arrival-meadow', 'meadow', [0, 72], [28, 18], 'near', 0.2),
	district('central-plaza', 'formal', [0, 8], [24, 18], 'near', 0.8),
	district('shul-quarter', 'cottage', [58, 8], [28, 20], 'near', 1.4),
	district('market-quarter', 'cottage', [-58, 14], [30, 22], 'near', 2.0),
	district('beis-chabad-rise', 'herb', [18, -62], [28, 18], 'medium', 2.6),
	district('lakeside-gardens', 'water-edge', [-76, -54], [38, 24], 'medium', 0.5),
	district('orchard-terraces', 'woodland', [82, -66], [38, 28], 'medium', 1.1),
	district('shepherd-fields', 'meadow', [116, 42], [48, 34], 'far', 1.8),
	district('mountain-shrine', 'rock-garden', [-122, 62], [42, 28], 'far', 2.4),
	district('wilderness-ring', 'woodland', [8, -138], [64, 42], 'far', 3.0)
]);

export const VILLAGE_DISTRICT_CLEARINGS = Object.freeze([
	clearing('arrival-spawn', 0, 72, 10),
	clearing('central-plaza', 0, 8, 13),
	clearing('shul-courtyard', 58, 8, 10),
	clearing('market-square', -58, 14, 12),
	clearing('beis-chabad-door', 18, -62, 9),
	clearing('lakeside-bridge', -58, -42, 8),
	clearing('orchard-road', 72, -52, 8),
	clearing('shepherd-fold', 116, 42, 10),
	clearing('mountain-path', -104, 52, 8),
	clearing('wilderness-arena', 8, -138, 16)
]);

export function villageDistrictsForHabitat(habitat) {
	const matches = VILLAGE_DISTRICTS.filter((item) => item.habitat === habitat);
	return matches.length > 0
		? matches
		: VILLAGE_DISTRICTS.filter((item) => item.habitat === 'cottage');
}

function district(id, habitat, center, radius, detail, phase) {
	return Object.freeze({
		center: Object.freeze(center),
		detail,
		habitat,
		id,
		phase,
		radius: Object.freeze(radius)
	});
}

function clearing(id, x, z, radius) {
	return Object.freeze({ id, radius, x, z });
}
