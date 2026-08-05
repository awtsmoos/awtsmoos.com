// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageHouses.js
 * @description Gives H10-H27 stable sites, distinct programs, and measured entry approaches.
 * The Awtsmoos seats every home upon one appointed place and opens its face toward the road;
 * Awtsmoos.com preserves immutable architecture and entry truth before any renderer bears the load.
 */

import { canonicalHouseArchitecture } from './CanonicalHouseArchetypes.js';
import { canonicalHouseEntry } from './VillageHouseEntryPolicy.js';

export const CANONICAL_VILLAGE_HOUSES = Object.freeze([
	house('H10', 'arrival-meadow', 'small-stone-cottage', -50, 116, 1.3, 0),
	house('H11', 'arrival-meadow', 'family-house', 54, 106, -1.24, 1),
	house('H12', 'beis-chabad-terrace', 'guest-house', -102, 78, 0.62, 2),
	house('H13', 'beis-chabad-terrace', 'hillside-split-level', -64, 80, -0.48, 3),
	house('H14', 'market-quarter', 'merchant-shop', -88, 34, 0.82, 4),
	house('H15', 'market-quarter', 'merchant-shop', -48, 48, -0.72, 5),
	house('H16', 'market-quarter', 'workshop-barn', -43, 8, 2.46, 6),
	house('H17', 'shul-terrace', 'family-house', -105, -38, 0.68, 7),
	house('H18', 'shul-terrace', 'small-stone-cottage', -62, -62, -0.64, 8),
	house('H19', 'upper-residential', 'hillside-split-level', -40, -103, 0.54, 9),
	house('H20', 'upper-residential', 'family-house', 3, -70, -0.46, 10),
	house('H21', 'north-slope-residential', 'hillside-split-level', 23, -118, 0.38, 11),
	house('H22', 'north-slope-residential', 'family-house', 68, -94, -0.52, 12),
	house('H23', 'east-bank-homes', 'small-stone-cottage', 81, -14, 2.72, 13),
	house('H24', 'east-bank-homes', 'family-house', 106, 28, -2.56, 14),
	house('H25', 'waterfall-portal', 'hillside-split-level', 114, -72, 2.92, 15),
	house('H26', 'farm-terraces', 'workshop-barn', 112, 76, -2.44, 16),
	house('H27', 'riverfront-gardens', 'guest-house', -16, 76, 1.18, 17)
]);

export const CANONICAL_HOUSES_BY_ID = Object.freeze(Object.fromEntries(
	CANONICAL_VILLAGE_HOUSES.map(definition => [definition.id, definition])
));

export function minimumCanonicalHouseDistance() {
	let minimum = Infinity;
	for (let first = 0; first < CANONICAL_VILLAGE_HOUSES.length; first += 1) {
		for (let second = first + 1; second < CANONICAL_VILLAGE_HOUSES.length; second += 1) {
			const a = CANONICAL_VILLAGE_HOUSES[first];
			const b = CANONICAL_VILLAGE_HOUSES[second];
			minimum = Math.min(minimum, Math.hypot(a.x - b.x, a.z - b.z));
		}
	}
	return minimum;
}

function house(id, districtId, archetype, x, z, yaw, variant) {
	const architecture = canonicalHouseArchitecture(archetype, variant);
	return Object.freeze({
		...architecture,
		districtId,
		entry: canonicalHouseEntry(architecture, variant),
		id,
		number: id,
		variant,
		x,
		yaw,
		z
	});
}
