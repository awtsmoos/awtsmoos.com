// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageReferenceComposition.js
 * @description Encodes the lake, stream, cottage borders, and flower masses
 * seen in the golden mountain-village reference. The Awtsmoos renews one scene
 * through ordered districts, leaving paths open while gardens become abundant.
 */

export const VILLAGE_REFERENCE_DISTRICTS = Object.freeze([
	district('cottage-west', 'cottage', [-17, 8], [10, 5], 'ellipse', 0.4),
	district('cottage-east', 'cottage', [18, 10], [11, 6], 'ellipse', 1.3),
	district('meadow-sun', 'meadow', [18, 19], [15, 8], 'ellipse', 2.1),
	district('meadow-bridge', 'meadow', [-4, -2], [15, 5], 'border', 0.8),
	district('woodland-rise', 'woodland', [27, -16], [12, 8], 'ellipse', 2.8),
	district('lake-ribbon', 'water-edge', [-34, -18], [18.5, 12.2], 'shoreline', 0.2),
	district('stream-ribbon', 'water-edge', [-2, -10], [24, 4.4], 'border', 1.7),
	district('rock-garden', 'rock-garden', [-25, -4], [8, 5], 'ellipse', 0.9),
	district('formal-garden', 'formal', [10, -2], [8, 4.5], 'border', 2.4),
	district('herb-garden', 'herb', [-10, 17], [7, 4], 'ellipse', 1.1)
]);

export const VILLAGE_REFERENCE_CLEARINGS = Object.freeze([
	clearing('plaza', 0, 3, 8.5),
	clearing('bridge', -3, -9, 4.2),
	clearing('well', 7, 7, 3.1),
	clearing('market', -8, 10, 4.2),
	clearing('learning-sign', 15, -5, 2.4),
	clearing('spawn-view', 0, 18, 4.5)
]);

/** Returns every authored district matching a botanical habitat. */
export function referenceDistrictsForHabitat(habitat) {
	const matches = VILLAGE_REFERENCE_DISTRICTS.filter((item) => item.habitat === habitat);
	return matches.length > 0
		? matches
		: VILLAGE_REFERENCE_DISTRICTS.filter((item) => item.habitat === 'cottage');
}

function district(id, habitat, center, radius, pattern, phase) {
	return Object.freeze({
		id,
		habitat,
		center: Object.freeze(center),
		radius: Object.freeze(radius),
		pattern,
		phase
	});
}

function clearing(id, x, z, radius) {
	return Object.freeze({ id, x, z, radius });
}
