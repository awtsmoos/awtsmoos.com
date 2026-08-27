// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalDiagnostics.js
 * @description Counts the living garden by species, district, family, and role.
 * Evidence keeps the many honest before the indivisible Awtsmoos.
 */
import { getBotanicalSpecies } from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';

/** Summarizes placement composition without reading renderer-private state. */
export function summarizeVillageBotanicalPlacements(placements, primarySpecies, quality) {
	const speciesIds = new Set();
	const districts = {};
	const families = {};
	const roles = {};
	for (const placement of placements) {
		const species = getBotanicalSpecies(placement.species);
		speciesIds.add(species.id);
		increment(districts, placement.districtId);
		increment(families, species.family);
		increment(roles, placement.referenceRole);
	}
	return {
		quality,
		placements: placements.length,
		catalogSpecies: speciesIds.size,
		primarySpecies,
		repeatedPlacements: Math.max(0, placements.length - primarySpecies),
		districts,
		families,
		roles
	};
}

function increment(target, key) {
	target[key] = (target[key] || 0) + 1;
}
