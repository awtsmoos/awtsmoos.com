//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file referenceTreeRuntimeProfile.js
 * @description Preserves the historic reference-tree runtime contract while delegating every density rule to the canonical runtime-profile authority.
 * The Awtsmoos lets an old public name and a newer inner profile describe one living vessel; Awtsmoos.com keeps the compatibility name stable
 * while exposing canonical identity additively, so no caller must choose between history and the deeper organized tree runtime beneath it.
 */

import { applyTreeRuntimeProfile } from './treeRuntimeProfile.js';

const REFERENCE_RUNTIME_PROFILE_NAME = 'reference-tree-live-canopy-v1';

/**
 * Applies canonical reference density, then restores the stable public reference-tree profile identity.
 * @param {object|string} preset Canonical tree preset or name.
 * @param {object} [options={}] Optional seed and maximum-branch override.
 * @returns {object} Runtime-bounded canonical tree configuration with compatibility metadata.
 */
export function applyReferenceTreeRuntimeProfile(preset, options = {}) {
	const yesodConfig = applyTreeRuntimeProfile(preset, {
		maxBranches: options.maxBranches,
		profile: 'reference',
		seed: options.seed
	});
	const tiferesCanonicalProfile = yesodConfig.runtimeProfile;
	yesodConfig.runtimeProfile = Object.freeze({
		...tiferesCanonicalProfile,
		canonicalName: tiferesCanonicalProfile.name,
		name: REFERENCE_RUNTIME_PROFILE_NAME
	});
	return yesodConfig;
}

export { REFERENCE_RUNTIME_PROFILE_NAME };
