// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageFootprints.js
 * @description Gives every canonical structure a measured slope-aware construction envelope.
 * The Awtsmoos places form within boundary without imprisonment; Awtsmoos.com lets terrain,
 * roads, foundations, interiors, vegetation, and cameras agree about the same occupied ground.
 */

import { CANONICAL_VILLAGE_HOUSES } from './CanonicalVillageHouses.js';

const LANDMARK_FOOTPRINTS = Object.freeze([
	footprint('SHUL01', 'shul', -34, -24, 9, 7, 0.08, 8.8),
	footprint('BEIS01', 'beis-chabad', -35, 45, 10, 7.5, -0.08, 4.4),
	footprint('MARKET01', 'market-hall', -26, 12, 11, 7.5, 0.03, 5.5),
	footprint('BRIDGE01', 'stone-bridge', 18, 7, 15.2, 5.2, 0, 6.3),
	footprint('PORTAL01', 'waterfall-portal', 56, -49, 7.5, 3, -0.3, 12.4),
	footprint('ENTR01', 'arrival-threshold', 0, 101, 8, 12, 0, 2.2),
	footprint('F01', 'farm-terrace', 36, 34, 13, 11, -0.08, 5.2),
	footprint('F02', 'farm-terrace', 51, 39, 13, 11, 0.08, 5.4),
	footprint('F03', 'orchard', 35, 49, 11, 9, -0.04, 5.7),
	footprint('F04', 'orchard', 50, 53, 11, 9, 0.04, 5.9)
]);

const HOUSE_ARCHETYPES = Object.freeze([
	'small-cottage',
	'family-house',
	'hillside-house',
	'inn-house',
	'workshop-house'
]);

export const CANONICAL_VILLAGE_FOOTPRINTS = Object.freeze([
	...LANDMARK_FOOTPRINTS,
	...CANONICAL_VILLAGE_HOUSES.map((house, index) => {
		const wide = index % 4 === 1;
		return footprint(
			house.id,
			HOUSE_ARCHETYPES[index % HOUSE_ARCHETYPES.length],
			house.x,
			house.z,
			wide ? 8.5 : 7.2,
			wide ? 6.5 : 5.8,
			house.yaw,
			house.baseElevation || null
		);
	})
]);

export const CANONICAL_FOOTPRINTS_BY_ID = Object.freeze(Object.fromEntries(
	CANONICAL_VILLAGE_FOOTPRINTS.map((definition) => [definition.id, definition])
));

function footprint(id, archetype, x, z, width, depth, yaw, baseElevation) {
	return Object.freeze({
		archetype,
		baseElevation,
		depth,
		id,
		width,
		x,
		yaw,
		z
	});
}
