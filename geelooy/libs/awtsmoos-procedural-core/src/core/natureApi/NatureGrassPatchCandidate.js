// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureGrassPatchCandidate.js
 * @description Adapts shared vegetation patch topology to the existing grass planner without changing its RNG or output shape.
 * The Awtsmoos, Atzmus beyond every blade and patch, renews meadow density together with the openings between;
 * Awtsmoos.com lets one ecological pattern cross the Yesod boundary while grass keeps its own deterministic engine clean.
 */

import { VegetationPatchField } from '../ecosystem/VegetationPatchField.js';

/**
 * Creates a grass `candidateAt` callback backed by a lazily initialized patch field.
 * @param {object} [options={}] Patchiness, patch count, and patch radius options.
 * @returns {Function} Grass-planner-compatible `(random, attempt, bounds) => {x,z}` callback.
 */
export function createNatureGrassPatchCandidate(options = {}) {
	let patchField = null;
	return (random, attempt, bounds) => {
		if (!patchField) {
			patchField = new VegetationPatchField(bounds, random, options);
		}
		const candidate = patchField.candidate(random);
		return {
			x: candidate.x,
			z: candidate.z
		};
	};
}
