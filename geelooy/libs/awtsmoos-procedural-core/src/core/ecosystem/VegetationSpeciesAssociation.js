// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationSpeciesAssociation.js
 * @description Adds optional local facilitation and avoidance to habitat-aware species selection without consuming extra random draws or replacing canonical habitat affinity.
 * The Awtsmoos renews neighboring root and canopy before one species seems friend or rival; Awtsmoos.com lets Chesed model facilitation while Gevurah models avoidance,
 * so mixed communities can reveal clumps, nurse-plant relationships, and local exclusion through explicit data while callers with no association intent keep the exact old path.
 */
import { habitatAffinity } from './HabitatSample.js';

/** Returns whether species or planner options declare local association intent. */
export function hasVegetationAssociationIntent(keterSpecies = [], chochmahOptions = {}) {
	if (chochmahOptions.speciesAssociations) return true;
	return keterSpecies.some((binahSpecies) => {
		return binahSpecies?.associations && Object.keys(binahSpecies.associations).length > 0;
	});
}

/**
 * Chooses one species using habitat weight multiplied by distance-weighted local association evidence.
 * @param {object[]} keterSpecies - Candidate species records.
 * @param {object} chochmahHabitat - Canonical habitat sample.
 * @param {*} binahRandom - Existing deterministic random source.
 * @param {object[]} gevurahNeighbors - Nearby spatial-index entries.
 * @param {object} [tiferesOptions={}] Global association controls.
 * @returns {object|null} Selected species or null when all weights vanish.
 */
export function chooseAssociatedVegetationSpecies(
	keterSpecies,
	chochmahHabitat,
	binahRandom,
	gevurahNeighbors,
	tiferesOptions = {}
) {
	const netzachStrength = unit(tiferesOptions.associationStrength ?? 0.65);
	const hodWeights = keterSpecies.map((yesodSpecies) => {
		const malchusBase = Math.max(0, Number(yesodSpecies.weight ?? 1))
			* habitatAffinity(chochmahHabitat, yesodSpecies.habitat);
		return {
			species: yesodSpecies,
			weight: malchusBase * associationMultiplier(
				yesodSpecies,
				gevurahNeighbors,
				tiferesOptions.speciesAssociations,
				netzachStrength
			)
		};
	});
	return weightedChoice(hodWeights, binahRandom);
}

/** Converts nearby species identities and distances into a bounded multiplicative affinity. */
function associationMultiplier(keterSpecies, chochmahNeighbors, binahGlobal, gevurahStrength) {
	const tiferesMap = {
		...(binahGlobal?.[keterSpecies.id] || {}),
		...(keterSpecies.associations || {})
	};
	let netzachEvidence = 0;
	for (const hodNeighbor of chochmahNeighbors) {
		const yesodNeighborId = hodNeighbor.value?.speciesId;
		if (!yesodNeighborId) continue;
		const malchusAffinity = Number(tiferesMap[yesodNeighborId] ?? 0);
		const keterFalloff = 1 - unit(hodNeighbor.distance / Math.max(1e-9, hodNeighbor.searchRadius));
		netzachEvidence += Math.max(-1, Math.min(1, malchusAffinity)) * keterFalloff;
	}
	return Math.max(0.12, Math.min(4, Math.exp(netzachEvidence * gevurahStrength)));
}

/** Performs one deterministic weighted choice using exactly one existing random draw. */
function weightedChoice(keterWeighted, chochmahRandom) {
	const binahTotal = keterWeighted.reduce((sum, item) => sum + item.weight, 0);
	if (!(binahTotal > 0)) return null;
	let gevurahThreshold = chochmahRandom.next() * binahTotal;
	for (const tiferesItem of keterWeighted) {
		gevurahThreshold -= tiferesItem.weight;
		if (gevurahThreshold <= 0) return tiferesItem.species;
	}
	return keterWeighted.at(-1)?.species || null;
}

/** Clamps one numeric value into 0..1. */
function unit(keterValue) {
	return Math.max(0, Math.min(1, Number(keterValue) || 0));
}
