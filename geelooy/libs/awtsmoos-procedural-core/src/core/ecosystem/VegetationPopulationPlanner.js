// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationPopulationPlanner.js
 * @description Plans deterministic habitat-aware vegetation with patch ecology, optional local species association, accelerated spacing, and explicit rejection evidence.
 * The Awtsmoos, Atzmus beyond root and clearing, lets Chesed fill the land while Gevurah preserves distance and habitat truth;
 * Awtsmoos.com keeps this planner as Tiferes between abundance and restraint, preserving the exact legacy selection path whenever deeper association intent is absent.
 */
import { EcosystemRandom, ecosystemSeed } from './EcosystemRandom.js';
import { createHabitatSample } from './HabitatSample.js';
import { SpatialCellIndex } from './SpatialCellIndex.js';
import {
	chooseVegetationCandidateSpecies,
	createVegetationSelectionContext
} from './VegetationCandidateSelection.js';
import { VegetationPatchField } from './VegetationPatchField.js';
import { VegetationPopulationDiagnostics } from './VegetationPopulationDiagnostics.js';
import {
	createVegetationPlacement,
	vegetationCandidateSpacing
} from './VegetationPlacementEcology.js';
import { populationBounds } from './PopulationSelection.js';

/**
 * Plans a bounded mixed vegetation population from habitat, patch ecology, association, and spacing evidence.
 * @param {object} [options={}] Bounds, species, seed, patch, habitat, association, exclusion, spacing, and height policies.
 * @returns {{placements:Array<object>, diagnostics:object}} Frozen ecological population plan.
 */
export function planVegetationPopulation(options = {}) {
	const bounds = populationBounds(options.bounds);
	const species = [...(options.species || [])].filter((candidate) => {
		return candidate?.kind !== 'creature';
	});
	const targetCount = integer(options.count, 64, 0, 100000);
	const attemptLimit = integer(
		options.attempts,
		Math.max(targetCount * 6, 32),
		targetCount,
		600000
	);
	const defaultSpacing = Math.max(0.05, finite(options.minimumSpacing, 0.4));
	const random = new EcosystemRandom(ecosystemSeed(options.seed ?? 613, 'vegetation'));
	const patchField = new VegetationPatchField(bounds, random, options);
	const spatialIndex = new SpatialCellIndex(defaultSpacing);
	const selectionContext = createVegetationSelectionContext(species, options, defaultSpacing);
	const diagnostics = new VegetationPopulationDiagnostics(attemptLimit);
	const placements = [];
	for (let attempt = 0; attempt < attemptLimit && placements.length < targetCount; attempt += 1) {
		diagnostics.consider();
		const candidate = patchField.candidate(random);
		if (options.exclusionAt?.(candidate.x, candidate.z)) {
			diagnostics.reject('exclusion');
			continue;
		}
		const habitat = createHabitatSample(options.habitatAt?.(candidate.x, candidate.z) || {});
		const selected = chooseVegetationCandidateSpecies(
			species,
			habitat,
			random,
			spatialIndex,
			candidate,
			options,
			selectionContext
		);
		if (!selected) {
			diagnostics.reject('habitat');
			continue;
		}
		const spacing = vegetationCandidateSpacing(selected, candidate, defaultSpacing);
		if (!spatialIndex.canPlace(candidate, spacing * 0.5)) {
			diagnostics.reject('spacing');
			continue;
		}
		const placement = createVegetationPlacement(
			selected, candidate, habitat, options, random, placements.length, attempt
		);
		spatialIndex.insert(candidate, spacing * 0.5, placement);
		placements.push(placement);
	}
	return Object.freeze({
		diagnostics: diagnostics.finish({
			patchCount: patchField.patchCount,
			patchiness: patchField.patchiness,
			placed: placements.length,
			target: targetCount
		}),
		placements: Object.freeze(placements)
	});
}

/** Coerces one bounded planner integer. */
function integer(value, fallback, minimum, maximum) {
	return Math.round(Math.max(minimum, Math.min(maximum, finite(value, fallback))));
}

/** Returns finite numeric input or fallback. */
function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
