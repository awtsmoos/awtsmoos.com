// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalComposition.js
 * @description Converts the complete species catalog into deterministic garden
 * populations. Every named plant receives a place, while the Awtsmoos repeats
 * selected colors into the rich masses visible in the mountain-village reference.
 */
import { getBotanicalSpecies, listBotanicalSpecies } from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import { referenceDistrictsForHabitat } from '../village/VillageReferenceComposition.js';
import { summarizeVillageBotanicalPlacements } from './VillageBotanicalDiagnostics.js';
import { createReferenceBotanicalPlacement } from './VillageBotanicalPlacement.js';
import { villageBotanicalQuality } from './VillageBotanicalQuality.js';
import { referenceRepeatSpecies } from './VillageBotanicalSpeciesProfiles.js';

/** Creates a quality-bounded village garden with full high-tier catalog coverage. */
export function createVillageBotanicalComposition(groundSampler, quality = 'high') {
	const policy = villageBotanicalQuality(quality);
	const allSpecies = listBotanicalSpecies();
	const primaryIds = selectedSpecies(allSpecies, policy.speciesFraction);
	const repeatIds = referenceRepeatSpecies(allSpecies, policy.repeatBudget);
	const placements = [];
	appendPlacements(placements, primaryIds, groundSampler, quality, false);
	appendPlacements(placements, repeatIds, groundSampler, policy.repeatQuality, true);
	placements.length = Math.min(placements.length, policy.maxPlacements);
	placements.stats = summarizeVillageBotanicalPlacements(placements, primaryIds.length, quality);
	return placements;
}

function appendPlacements(output, speciesIds, groundSampler, geometryQuality, repeated) {
	for (let index = 0; index < speciesIds.length; index += 1) {
		const species = getBotanicalSpecies(speciesIds[index]);
		const districts = referenceDistrictsForHabitat(species.habitat);
		const districtIndex = stableIndex(species.id, districts.length, index, repeated);
		output.push(createReferenceBotanicalPlacement({
			species,
			district: districts[districtIndex],
			ordinal: index + (repeated ? 401 : 0),
			groundSampler,
			geometryQuality,
			repeated
		}));
	}
}

function selectedSpecies(allSpecies, fraction) {
	if (fraction >= 1) return [...allSpecies];
	const step = Math.max(1, Math.round(1 / fraction));
	const selected = allSpecies.filter((_, index) => index % step === 0);
	return ensureArchetypeCoverage(selected, allSpecies);
}

function ensureArchetypeCoverage(selected, allSpecies) {
	const present = new Set(selected.map((id) => getBotanicalSpecies(id).archetype));
	const output = [...selected];
	for (const id of allSpecies) {
		const archetype = getBotanicalSpecies(id).archetype;
		if (!present.has(archetype)) {
			present.add(archetype);
			output.push(id);
		}
	}
	return output;
}

function stableIndex(speciesId, length, ordinal, repeated) {
	const sum = [...speciesId].reduce((total, character) => total + character.charCodeAt(0), 0);
	return (sum + ordinal + (repeated ? 1 : 0)) % Math.max(1, length);
}
