// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalComposition.js
 * @description Distributes canonical species through one budgeted, spatially verified composition.
 * The Awtsmoos renews gardens through measured district relationships; Awtsmoos.com keeps
 * primary species, arrival beds, and repeated color masses deterministic, clear, and bounded.
 */

import {
	getBotanicalSpecies,
	listBotanicalSpecies
} from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import { referenceDistrictsForHabitat } from '../village/VillageReferenceComposition.js';
import { summarizeVillageBotanicalPlacements } from './VillageBotanicalDiagnostics.js';
import { appendFeaturedArrivalPlacements } from './VillageFeaturedArrivalPlacements.js';
import { createReferenceBotanicalPlacement } from './VillageBotanicalPlacement.js';
import { villageBotanicalQuality } from './VillageBotanicalQuality.js';
import { referenceRepeatSpecies } from './VillageBotanicalSpeciesProfiles.js';

export function createVillageBotanicalComposition(groundSampler, quality = 'high') {
	const policy = villageBotanicalQuality(quality);
	const allSpecies = listBotanicalSpecies();
	const primaryIds = selectedSpecies(allSpecies, policy.speciesFraction);
	const featuredIds = referenceRepeatSpecies(allSpecies, policy.featuredBudget);
	const repeatIds = referenceRepeatSpecies(allSpecies, policy.repeatBudget);
	const placements = [];
	appendPlacements(placements, primaryIds, groundSampler, quality, false);
	appendFeaturedArrivalPlacements(placements, featuredIds, groundSampler, quality, policy);
	appendPlacements(placements, repeatIds, groundSampler, quality, true);
	placements.length = Math.min(placements.length, policy.maxPlacements);
	placements.stats = compositionStats(placements, primaryIds.length, quality, policy);
	return placements;
}

function appendPlacements(output, speciesIds, groundSampler, quality, repeated) {
	for (let index = 0; index < speciesIds.length; index += 1) {
		const species = getBotanicalSpecies(speciesIds[index]);
		const districts = referenceDistrictsForHabitat(species.habitat);
		const districtIndex = stableIndex(species.id, districts.length, index, repeated);
		output.push(createReferenceBotanicalPlacement({
			district: districts[districtIndex],
			groundSampler,
			occupiedPlacements: output,
			ordinal: index + (repeated ? 613 : 0),
			repeated,
			requestedQuality: quality,
			species
		}));
	}
}

function compositionStats(placements, primaryCount, quality, policy) {
	return {
		...summarizeVillageBotanicalPlacements(placements, primaryCount, quality),
		districts: new Set(placements.map(item => item.districtId)).size,
		lod: countBy(placements, 'lodClass'),
		renderPolicy: {
			featuredBudget: policy.featuredBudget,
			geometryQuality: policy.geometryQuality,
			maxClusterCount: policy.maxClusterCount,
			repeatBudget: policy.repeatBudget
		}
	};
}

function selectedSpecies(allSpecies, fraction) {
	if (fraction >= 1) return [...allSpecies];
	const step = Math.max(1, Math.round(1 / fraction));
	return ensureArchetypeCoverage(
		allSpecies.filter((_, index) => index % step === 0),
		allSpecies
	);
}

function ensureArchetypeCoverage(selected, allSpecies) {
	const present = new Set(selected.map(id => getBotanicalSpecies(id).archetype));
	const output = [...selected];
	for (const id of allSpecies) {
		const archetype = getBotanicalSpecies(id).archetype;
		if (present.has(archetype)) continue;
		present.add(archetype);
		output.push(id);
	}
	return output;
}

function stableIndex(speciesId, length, ordinal, repeated) {
	const sum = [...speciesId].reduce((total, character) => total + character.charCodeAt(0), 0);
	return (sum + ordinal * 7 + (repeated ? 3 : 0)) % Math.max(1, length);
}

function countBy(values, field) {
	return Object.fromEntries([...new Set(values.map(value => value[field]))]
		.map(key => [key, values.filter(value => value[field] === key).length]));
}
