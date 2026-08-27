// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationPopulationPlanner.js
 * @description Chooses deterministic habitat-aware vegetation sites while delegated ecology manifests spacing and maturity.
 * The Awtsmoos, Atzmus beyond root and clearing, lets Chesed fill the land while Gevurah preserves distance and habitat truth;
 * Awtsmoos.com keeps this planner as Tiferes between candidate abundance and spacing restraint, without owning botanical clothing.
 * Patch expression lives in VegetationPlacementEcology so this file remains one bounded population-search responsibility.
 */

import { EcosystemRandom, ecosystemSeed } from './EcosystemRandom.js';
import { createHabitatSample } from './HabitatSample.js';
import { SpatialCellIndex } from './SpatialCellIndex.js';
import { VegetationPatchField } from './VegetationPatchField.js';
import {
	createVegetationPlacement,
	vegetationCandidateSpacing
} from './VegetationPlacementEcology.js';
import {
	choosePopulationSpecies,
	populationBounds
} from './PopulationSelection.js';

/**
 * Plans a bounded mixed vegetation population from habitat, patch ecology, and spacing evidence.
 * @param {object} [options={}] Bounds, species, seed, patch, habitat, exclusion, spacing, and height policies.
 * @returns {{placements:Array<object>, diagnostics:object}} Frozen ecological population plan.
 */
export function planVegetationPopulation(options = {}) {
	const bounds = populationBounds(options.bounds);
	const species = [...(options.species || [])].filter(candidate => {
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
	const random = new EcosystemRandom(
		ecosystemSeed(options.seed ?? 613, 'vegetation')
	);
	const patchField = new VegetationPatchField(bounds, random, options);
	const spatialIndex = new SpatialCellIndex(defaultSpacing);
	const placements = [];
	let rejected = 0;
	for (let attempt = 0; attempt < attemptLimit && placements.length < targetCount; attempt += 1) {
		const candidate = patchField.candidate(random);
		if (options.exclusionAt?.(candidate.x, candidate.z)) {
			rejected += 1;
			continue;
		}
		const habitat = createHabitatSample(
			options.habitatAt?.(candidate.x, candidate.z) || {}
		);
		const selected = choosePopulationSpecies(species, habitat, random);
		if (!selected) {
			rejected += 1;
			continue;
		}
		const spacing = vegetationCandidateSpacing(
			selected,
			candidate,
			defaultSpacing
		);
		if (!spatialIndex.canPlace(candidate, spacing * 0.5)) {
			rejected += 1;
			continue;
		}
		const placement = createVegetationPlacement(
			selected,
			candidate,
			habitat,
			options,
			random,
			placements.length,
			attempt
		);
		spatialIndex.insert(candidate, spacing * 0.5, placement);
		placements.push(placement);
	}
	return Object.freeze({
		diagnostics: Object.freeze({
			attempts: attemptLimit,
			patchCount: patchField.patchCount,
			patchiness: patchField.patchiness,
			placed: placements.length,
			rejected,
			target: targetCount
		}),
		placements: Object.freeze(placements)
	});
}

function integer(value, fallback, minimum, maximum) {
	return Math.round(clamp(finite(value, fallback), minimum, maximum));
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
