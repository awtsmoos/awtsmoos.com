// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalComposition.js
 * @description Distributes the complete botanical catalog across expanded districts.
 * Every species receives a deterministic place while the Awtsmoos repeats selected
 * colors into near, middle, and far masses that remain bounded for Awtsmoos.com play.
 */

import {
	getBotanicalSpecies,
	listBotanicalSpecies
} from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import {
	referenceDistrictsForHabitat,
	VILLAGE_REFERENCE_DISTRICTS
} from '../village/VillageReferenceComposition.js';
import { villageGroundHeight } from '../village/VillageGroundSampling.js';
import { summarizeVillageBotanicalPlacements } from './VillageBotanicalDiagnostics.js';
import { createReferenceBotanicalPlacement } from './VillageBotanicalPlacement.js';
import { villageBotanicalQuality } from './VillageBotanicalQuality.js';
import { referenceRepeatSpecies } from './VillageBotanicalSpeciesProfiles.js';

export function createVillageBotanicalComposition(groundSampler, quality = 'high') {
	const policy = villageBotanicalQuality(quality);
	const allSpecies = listBotanicalSpecies();
	const primaryIds = selectedSpecies(allSpecies, policy.speciesFraction);
	const repeatIds = referenceRepeatSpecies(allSpecies, policy.repeatBudget);
	const placements = [];
	appendPlacements(placements, primaryIds, groundSampler, quality, false);
	appendFeaturedArrivalPlacements(placements, repeatIds.slice(0, 24), groundSampler, quality);
	appendPlacements(placements, repeatIds, groundSampler, quality, true);
	placements.length = Math.min(placements.length, policy.maxPlacements);
	placements.stats = {
		...summarizeVillageBotanicalPlacements(placements, primaryIds.length, quality),
		districts: new Set(placements.map((item) => item.districtId)).size,
		lod: countBy(placements, 'lodClass')
	};
	return placements;
}

function appendFeaturedArrivalPlacements(output, speciesIds, groundSampler, quality) {
	const district = VILLAGE_REFERENCE_DISTRICTS.find((item) => item.id === 'arrival-meadow');
	for (let index = 0; index < speciesIds.length; index += 1) {
		const species = getBotanicalSpecies(speciesIds[index]);
		const placement = createReferenceBotanicalPlacement({
			district,
			groundSampler,
			ordinal: 900 + index,
			repeated: true,
			requestedQuality: quality,
			species
		});
		const row = Math.floor(index / 2);
		const side = index % 2 === 0 ? -1 : 1;
		const z = 83 - row * 2.15;
		const clearingOffset = z - 72;
		const clearingSafeX = Math.sqrt(Math.max(0, 11 * 11 - clearingOffset * clearingOffset));
		const x = side * Math.max(4.85 + row % 3 * 0.58, clearingSafeX);
		placement.clusterRadius = 0.38;
		placement.clusterCount = quality === 'low' ? 3 : 4;
		placement.districtId = district.id;
		placement.geometryQuality = quality === 'low' ? 'low' : 'medium';
		placement.lodClass = 'near';
		placement.position = { x, y: villageGroundHeight(groundSampler, x, z), z };
		placement.scale *= 1.78;
		output.push(placement);
	}
}

function appendPlacements(output, speciesIds, groundSampler, quality, repeated) {
	for (let index = 0; index < speciesIds.length; index += 1) {
		const species = getBotanicalSpecies(speciesIds[index]);
		const districts = referenceDistrictsForHabitat(species.habitat);
		const districtIndex = stableIndex(species.id, districts.length, index, repeated);
		output.push(createReferenceBotanicalPlacement({
			district: districts[districtIndex],
			groundSampler,
			ordinal: index + (repeated ? 613 : 0),
			repeated,
			requestedQuality: quality,
			species
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
	return Object.fromEntries([...new Set(values.map((value) => value[field]))]
		.map((key) => [key, values.filter((value) => value[field] === key).length]));
}
