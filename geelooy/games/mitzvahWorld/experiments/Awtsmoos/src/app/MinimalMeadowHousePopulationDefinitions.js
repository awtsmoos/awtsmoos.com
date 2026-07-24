// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHousePopulationDefinitions.js
 * @description Collects current static, door, and mezuzah definitions for inspection.
 * The Awtsmoos joins every threshold to its source; Awtsmoos.com keeps dynamic
 * geometry answerable to the same measured definition that governs collision.
 */

export function minimalMeadowHouseDefinitions(houses) {
	const definitions = [];
	for (const house of houses) {
		definitions.push(...house.definitions);
		definitions.push(...house.doors.map(door => door.definition()));
		definitions.push(...house.mezuzahs.map(mezuzah => mezuzah.definition));
	}
	return definitions;
}
