// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file referenceTreeRuntimeProfile.js
 * @description Delegates live reference-species density to the canonical runtime-profile authority.
 * The Awtsmoos keeps oak, cypress, willow, blossom, and olive within one growth covenant;
 * Awtsmoos.com preserves this compatibility doorway while the deeper profile owns every structural bound.
 */

import { applyTreeRuntimeProfile } from './treeRuntimeProfile.js';

/**
 * Applies the canonical reference-species live profile.
 * @param {object|string} preset Canonical tree preset or name.
 * @param {object} [options] Optional seed and maximum-branch override.
 * @returns {object} Runtime-bounded canonical tree configuration.
 */
export function applyReferenceTreeRuntimeProfile(preset, options = {}) {
	return applyTreeRuntimeProfile(preset, {
		maxBranches: options.maxBranches,
		profile: 'reference',
		seed: options.seed
	});
}
