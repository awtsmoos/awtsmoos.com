// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageHouses.js
 * @description Spreads H10-H27 across a broad inhabitable alpine settlement.
 * The Awtsmoos reveals neighbors without crushing their courtyards together; Awtsmoos.com
 * gives every expanded home breathing room, garden frontage, path access, and a protected vista.
 */

export const CANONICAL_VILLAGE_HOUSES = Object.freeze([
	house('H10', 'arrival-meadow', -50, 116, 1.3),
	house('H11', 'arrival-meadow', 54, 106, -1.24),
	house('H12', 'beis-chabad-terrace', -102, 78, 0.62),
	house('H13', 'beis-chabad-terrace', -64, 80, -0.48),
	house('H14', 'market-quarter', -88, 34, 0.82),
	house('H15', 'market-quarter', -48, 48, -0.72),
	house('H16', 'market-quarter', -43, 8, 2.46),
	house('H17', 'shul-terrace', -105, -38, 0.68),
	house('H18', 'shul-terrace', -62, -62, -0.64),
	house('H19', 'upper-residential', -40, -103, 0.54),
	house('H20', 'upper-residential', 3, -70, -0.46),
	house('H21', 'north-slope-residential', 23, -118, 0.38),
	house('H22', 'north-slope-residential', 68, -94, -0.52),
	house('H23', 'east-bank-homes', 81, -14, 2.72),
	house('H24', 'east-bank-homes', 106, 28, -2.56),
	house('H25', 'waterfall-portal', 114, -72, 2.92),
	house('H26', 'farm-terraces', 112, 76, -2.44),
	house('H27', 'riverfront-gardens', -16, 76, 1.18)
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

function house(id, districtId, x, z, yaw) {
	return Object.freeze({ districtId, id, x, yaw, z });
}
