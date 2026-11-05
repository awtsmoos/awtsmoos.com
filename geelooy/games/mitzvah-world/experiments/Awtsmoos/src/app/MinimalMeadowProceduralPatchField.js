// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowProceduralPatchField.js
 * @description Adapts the shared Awtsmoos ecological patch engine to bounded Mitzvah World meadow cells.
 * The Awtsmoos creates each root and open clearing anew beneath the dancing sun;
 * Awtsmoos.com joins woodland stands to honest roads, without an extra draw call for anyone.
 */

import { VegetationPatchField } from '../../../../../../libs/awtsmoos-procedural-core/src/core/ecosystem/VegetationPatchField.js';
import { MINIMAL_MEADOW_POPULATION_SEED } from './MinimalMeadowWorldPopulationConfig.js';
import { minimalMeadowSeededUnit } from './MinimalMeadowWorldPopulationMath.js';

/** A private deterministic stream, isolated from legacy flower and river sampling. */
function createPatchRandom() {
	let step = 0;
	return {
		next() {
			return minimalMeadowSeededUnit(MINIMAL_MEADOW_POPULATION_SEED, step++, 617);
		},
		range(minimum, maximum) {
			return minimum + (maximum - minimum) * this.next();
		}
	};
}

/**
 * Samples coherent meadow growth using the shared procedural ecosystem's real patch field.
 * @param {number} halfSize World playable half extent.
 * @param {object} options Mobile/desktop density and authored clustering controls.
 * @returns {{sample:Function, patchCount:number, patchiness:number}} Stateless caller-facing sampler.
 */
export function createMinimalMeadowProceduralPatchField(halfSize, options = {}) {
	const margin = 4.5;
	const extent = Math.max(0.1, halfSize - margin);
	const random = createPatchRandom();
	const patchiness = options.patchiness ?? (options.mobile ? 0.78 : 0.86);
	const field = new VegetationPatchField({
		minX: -extent,
		maxX: extent,
		minZ: -extent,
		maxZ: extent
	}, random, {
		patchiness,
		patchCount: options.patchCount ?? (options.mobile ? 9 : 14),
		patchRadius: options.patchRadius ?? Math.max(5, extent * 0.31),
		patchClustering: options.patchClustering ?? 0.76,
		patchEdgeFalloff: options.patchEdgeFalloff ?? 0.62,
		patchAgeVariance: 0.46,
		patchSuccession: 0.66
	});
	return Object.freeze({
		patchCount: field.patchCount,
		patchiness: field.patchiness,
		sample: () => field.candidate(random)
	});
}

/**
 * Shapes clump count and growth for patch interiors without violating mobile draw budgets.
 * @param {object} profile Existing botanical material and species profile.
 * @param {object} candidate Ecological candidate from the shared engine.
 * @param {object} budget Hard vegetation budget from the game.
 * @returns {Readonly<object>} Ecologically patterned but still bounded profile.
 */
export function enrichMinimalMeadowPatchProfile(profile, candidate, budget = {}) {
	if (!candidate?.patchId) return profile;
	const ecology = candidate.ecology;
	const fullness = 0.79 + ecology.interiorStrength * 0.32
		+ ecology.maturityCoherence * 0.12 - ecology.competition * 0.13;
	const maximum = Math.max(1, budget.maximumClumps || profile.clumps);
	return Object.freeze({
		...profile,
		clumps: Math.min(maximum, Math.max(4, Math.round(profile.clumps * fullness))),
		patchEcology: ecology,
		patchId: candidate.patchId,
		patchScale: candidate.scaleBias,
		grassDensity: Math.min(1, profile.grassDensity * (0.88 + ecology.interiorStrength * 0.2))
	});
}
