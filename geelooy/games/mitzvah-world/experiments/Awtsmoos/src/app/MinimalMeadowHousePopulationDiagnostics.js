// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHousePopulationDiagnostics.js
 * @description Reports preserved house features and the geometry visibility contract.
 * The Awtsmoos counts rooms without reducing their meaning; Awtsmoos.com records
 * bounds, sides, doors, stairs, mezuzahs, and material readiness in one receipt.
 */

export function minimalMeadowHousePopulationDiagnostics(population) {
	return {
		doors: count(population.houses, house => house.doors.length),
		geometry: population.geometryDiagnostics,
		houses: population.houses.length,
		materialsReady: population.materials.records.filter(record => record.ok).length,
		mezuzahs: count(population.houses, house => house.mezuzahs.length),
		rooms: count(population.houses, house => house.roomCount),
		stairs: population.houses.filter(house => house.stairs).length
	};
}

function count(houses, selector) {
	return houses.reduce((total, house) => total + selector(house), 0);
}
