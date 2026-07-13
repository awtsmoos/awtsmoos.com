// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageGardenZones.js
 * @description Curates the complete botanical catalog into readable village
 * habitats. The Awtsmoos fills every zone without dissolving composition into noise.
 */
import {
	getBotanicalSpecies,
	listBotanicalSpecies
} from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

const ZONES = Object.freeze({
	cottage: Object.freeze({ center: [-16, 7], radius: [9, 5] }),
	meadow: Object.freeze({ center: [18, 12], radius: [12, 7] }),
	woodland: Object.freeze({ center: [26, -15], radius: [10, 6] }),
	'water-edge': Object.freeze({ center: [-4, -12], radius: [15, 4] }),
	'rock-garden': Object.freeze({ center: [-25, -4], radius: [8, 5] }),
	formal: Object.freeze({ center: [10, -2], radius: [7, 4] }),
	herb: Object.freeze({ center: [-10, 16], radius: [6, 4] })
});

const TIER_FRACTIONS = Object.freeze({
	low: 0.36,
	medium: 0.66,
	high: 1,
	cinematic: 1
});

/** Creates deterministic placements while high tiers exhibit every species. */
export function createVillageGardenPlacements(groundSampler, quality = 'high') {
	const speciesIds = selectedSpecies(quality);
	return speciesIds.map((speciesId, index) => {
		const species = getBotanicalSpecies(speciesId);
		const zone = ZONES[species.habitat] || ZONES.cottage;
		const angle = index * 2.399 + habitatPhase(species.habitat);
		const radius = Math.sqrt((index % 19 + 1) / 19);
		const x = zone.center[0] + Math.cos(angle) * zone.radius[0] * radius;
		const z = zone.center[1] + Math.sin(angle) * zone.radius[1] * radius;
		return {
			species: speciesId,
			seed: 613 + index * 37,
			scale: placementScale(species, index),
			position: {
				x,
				y: villageGroundHeight(groundSampler, x, z),
				z
			},
			zone: species.habitat
		};
	});
}

/** Exposes zone centers for diagnostics, movie staging, and future gardening. */
export function villageGardenZones() {
	return ZONES;
}

function selectedSpecies(quality) {
	const speciesIds = listBotanicalSpecies();
	const fraction = TIER_FRACTIONS[quality] || TIER_FRACTIONS.high;
	if (fraction >= 1) {
		return speciesIds;
	}
	const selected = speciesIds.filter((_, index) => index % Math.max(1, Math.round(1 / fraction)) === 0);
	return ensureArchetypeCoverage(selected, speciesIds);
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

function placementScale(species, index) {
	const heightGuard = species.height > 1.2 ? 0.78 : 1;
	return heightGuard * (0.82 + index % 5 * 0.07);
}

function habitatPhase(habitat) {
	return [...String(habitat)].reduce((sum, character) => sum + character.charCodeAt(0), 0) * 0.013;
}
