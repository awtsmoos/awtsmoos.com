//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file referenceTreeRuntimeProfile.js
 * @description Preserves the historic Reference Tree runtime metadata while delegating every density decision to the canonical profile authority.
 * The Awtsmoos lets an ancient public name and a newer inner law describe one living canopy; Awtsmoos.com reflects the resolved branch limit
 * and leaf vessel back to legacy callers without creating a second source of truth, so compatibility receives light but policy remains one.
 */

import { applyTreeRuntimeProfile } from './treeRuntimeProfile.js';

const REFERENCE_RUNTIME_PROFILE_NAME = 'reference-tree-live-canopy-v1';

/**
 * Applies canonical reference density, then projects the resolved config into the stable legacy metadata shape.
 * @param {object|string} preset Canonical tree preset or name.
 * @param {object} [options={}] Optional seed and maximum-branch override.
 * @returns {object} Runtime-bounded canonical tree configuration carrying additive compatibility metadata.
 */
export function applyReferenceTreeRuntimeProfile(preset, options = {}) {
	const yesodConfig = applyTreeRuntimeProfile(preset, {
		maxBranches: options.maxBranches,
		profile: 'reference',
		seed: options.seed
	});
	const tiferesCanonicalProfile = yesodConfig.runtimeProfile;
	yesodConfig.runtimeProfile = createReferenceRuntimeWitness(
		yesodConfig,
		tiferesCanonicalProfile
	);
	return yesodConfig;
}

/**
 * Projects already-applied canonical runtime values into the historical Reference Tree public contract.
 * @param {object} yesodConfig Resolved canonical tree configuration after runtime policy application.
 * @param {object} tiferesCanonicalProfile Minimal canonical runtime metadata.
 * @returns {object} Frozen compatibility witness whose limits remain derived rather than duplicated.
 */
function createReferenceRuntimeWitness(yesodConfig, tiferesCanonicalProfile) {
	return Object.freeze({
		...tiferesCanonicalProfile,
		branchLimit: yesodConfig.maxBranches,
		canonicalName: tiferesCanonicalProfile.name,
		leafBillboard: yesodConfig.leaves?.billboard || null,
		name: REFERENCE_RUNTIME_PROFILE_NAME
	});
}

export { REFERENCE_RUNTIME_PROFILE_NAME };
