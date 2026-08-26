// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationCandidateSelection.js
 * @description Chooses between the exact legacy habitat selector and optional neighbor-aware association ecology without changing planner orchestration.
 * The Awtsmoos renews each possible species before habitat or neighbor can incline the choice; Awtsmoos.com lets Binah preserve the old path exactly,
 * while Chessed and Gevurah may reveal nurse-plant facilitation or local avoidance only when explicit association data asks for deeper community structure.
 */
import { choosePopulationSpecies } from './PopulationSelection.js';
import {
	chooseAssociatedVegetationSpecies,
	hasVegetationAssociationIntent
} from './VegetationSpeciesAssociation.js';

/**
 * Creates immutable candidate-selection context once per population plan.
 * @param {object[]} keterSpecies - Population species records.
 * @param {object} chochmahOptions - Planner options.
 * @param {number} binahDefaultSpacing - Planner spacing floor.
 * @returns {Readonly<object>} Association selection context.
 */
export function createVegetationSelectionContext(keterSpecies, chochmahOptions, binahDefaultSpacing) {
	const gevurahEnabled = hasVegetationAssociationIntent(keterSpecies, chochmahOptions);
	return Object.freeze({
		associationRadius: Math.max(
			0.05,
			Number(chochmahOptions.associationRadius ?? Math.max(3, binahDefaultSpacing * 8))
		),
		enabled: gevurahEnabled
	});
}

/**
 * Chooses one species, delegating to the untouched legacy selector when association intent is absent.
 * @returns {object|null} Selected species record.
 */
export function chooseVegetationCandidateSpecies(
	keterSpecies,
	chochmahHabitat,
	binahRandom,
	gevurahSpatialIndex,
	tiferesCandidate,
	netzachOptions,
	hodContext
) {
	if (!hodContext.enabled) {
		return choosePopulationSpecies(keterSpecies, chochmahHabitat, binahRandom);
	}
	const yesodNeighbors = gevurahSpatialIndex.neighbors(
		tiferesCandidate,
		hodContext.associationRadius
	);
	return chooseAssociatedVegetationSpecies(
		keterSpecies,
		chochmahHabitat,
		binahRandom,
		yesodNeighbors,
		netzachOptions
	);
}
