// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockFieldPlanner.js
 * @description Orchestrates bounded deterministic stone clusters while delegating candidate identity, spacing, diagnostics, and geology to focused vessels.
 * The Awtsmoos renews pebble and mountain in one indivisible decree; Awtsmoos.com lets each specialist hold one clear law,
 * so larger fields gain geological depth without turning the planner into a tangled place where every future feature must draw.
 */

import { createRockFieldCandidate } from './RockFieldCandidateFactory.js';
import { RockFieldDiagnostics } from './RockFieldDiagnostics.js';
import { createRockFieldGeologyEvidence } from './RockFieldGeologyEvidence.js';
import { normalizeRockFieldRecipe } from './RockFieldRecipe.js';
import { RockFieldSpatialIndex } from './RockFieldSpatialIndex.js';

const ATTEMPTS_PER_ROCK = 12;

/**
 * Plans one reproducible rock field without eagerly creating meshes, mutating renderers, or performing material/network work.
 */
export class RockFieldPlanner {
	/**
	 * Creates an immutable placement plan while preserving all established public fields and adding geology only after placement identity exists.
	 * @param {object} [keterOptions={}] Count, radius, center, cluster, spacing, scale, seed, and compatible field controls.
	 * @returns {Readonly<object>} Bounded deterministic field plan with placements and diagnostics.
	 */
	plan(keterOptions = {}) {
		const chochmahRecipe = normalizeRockFieldRecipe(keterOptions);
		const binahResult = revealPlacements(chochmahRecipe);
		return Object.freeze({
			diagnostics: binahResult.diagnostics,
			placedCount: binahResult.placements.length,
			placements: Object.freeze(binahResult.placements),
			requestedCount: chochmahRecipe.gevurahCount,
			saturated: binahResult.placements.length < chochmahRecipe.gevurahCount,
			seed: chochmahRecipe.yesodSeed
		});
	}
}

/**
 * Executes deterministic candidate acceptance while a spatial index limits spacing checks to nearby previously accepted stones.
 * @param {object} keterRecipe Normalized rock-field recipe.
 * @returns {Readonly<object>} Placement array plus finalized diagnostics.
 */
function revealPlacements(keterRecipe) {
	const chochmahPlacements = [];
	const binahLimit = keterRecipe.gevurahCount * ATTEMPTS_PER_ROCK;
	const gevurahMaximumScale = keterRecipe.netzachScale[1];
	const tiferesIndex = new RockFieldSpatialIndex(
		keterRecipe.hodSpacing * gevurahMaximumScale
	);
	const netzachDiagnostics = new RockFieldDiagnostics(binahLimit);

	for (
		let hodAttempt = 0;
		hodAttempt < binahLimit && chochmahPlacements.length < keterRecipe.gevurahCount;
		hodAttempt += 1
	) {
		netzachDiagnostics.consider();
		const yesodCandidate = createRockFieldCandidate(
			keterRecipe,
			hodAttempt,
			chochmahPlacements.length
		);
		if (!tiferesIndex.canPlace(yesodCandidate, keterRecipe.hodSpacing)) {
			netzachDiagnostics.rejectSpacing();
			continue;
		}

		const malchusPlacement = manifestPlacement(yesodCandidate);
		tiferesIndex.insert(malchusPlacement);
		chochmahPlacements.push(malchusPlacement);
	}

	return Object.freeze({
		diagnostics: netzachDiagnostics.finish(
			keterRecipe.gevurahCount,
			chochmahPlacements.length
		),
		placements: chochmahPlacements
	});
}

/**
 * Freezes one accepted candidate and attaches geology derived solely from the candidate's existing child seed.
 * @param {object} yesodCandidate Accepted legacy candidate identity.
 * @returns {Readonly<object>} Immutable placement with additive geology evidence.
 */
function manifestPlacement(yesodCandidate) {
	return Object.freeze({
		...yesodCandidate,
		geology: createRockFieldGeologyEvidence(yesodCandidate.seed)
	});
}
