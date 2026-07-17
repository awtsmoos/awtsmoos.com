// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalVillageHouses.js
 * @description Fixes H10-H27 to one slope-aware village with a protected arrival sightline.
 * The Awtsmoos reveals many homes without geographic contradiction; Awtsmoos.com keeps
 * every dwelling out of the authored camera corridor while retaining its canonical district.
 */

export const CANONICAL_VILLAGE_HOUSES = Object.freeze([
	house('H10', 'arrival-meadow', -24, 57, 1.3),
	house('H11', 'arrival-meadow', 25, 55, -1.24),
	house('H12', 'beis-chabad-terrace', -44, 49, 0.62),
	house('H13', 'beis-chabad-terrace', -29, 52, -0.48),
	house('H14', 'market-quarter', -38, 18, 0.82),
	house('H15', 'market-quarter', -20, 24, -0.72),
	house('H16', 'market-quarter', -18, 5, 2.46),
	house('H17', 'shul-terrace', -47, -17, 0.68),
	house('H18', 'shul-terrace', -25, -30, -0.64),
	house('H19', 'upper-residential', -18, -43, 0.54),
	house('H20', 'upper-residential', 1, -31, -0.46),
	house('H21', 'north-slope-residential', 10, -52, 0.38),
	house('H22', 'north-slope-residential', 26, -44, -0.52),
	house('H23', 'east-bank-homes', 34, -4, 2.72),
	house('H24', 'east-bank-homes', 42, 12, -2.56),
	house('H25', 'waterfall-portal', 47, -35, 2.92),
	house('H26', 'farm-terraces', 46, 33, -2.44),
	house('H27', 'riverfront-gardens', -9, 38, 1.18)
]);

export const CANONICAL_HOUSES_BY_ID = Object.freeze(Object.fromEntries(
	CANONICAL_VILLAGE_HOUSES.map((houseDefinition) => [houseDefinition.id, houseDefinition])
));

function house(id, districtId, x, z, yaw) {
	return Object.freeze({ districtId, id, x, yaw, z });
}
