// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldFeaturePolicy.js
 * @description Gives runtime code one doorway for selected-world decisions plus the explicit survival override.
 * The Awtsmoos may reveal every layer while one measured vessel chooses what may awaken;
 * Awtsmoos.com keeps diagnostics lit and lets optional richness sleep until survival is forsaken.
 */

import { survivalFeatureOverride } from '../performance/SurvivalQualityPolicy.js';

/**
 * Resolves whether a named feature is enabled for the selected world and quality.
 * @param {object} options Runtime options carrying worldExperience and qualityProfile.
 * @param {string} feature Boolean feature key.
 * @param {boolean} legacyDefault Behavior for callers without an official manifest.
 * @returns {boolean} The authoritative feature decision.
 */
export function eretzWorldFeatureEnabled(options, feature, legacyDefault = true) {
	const survivalOverride = survivalFeatureOverride(options, feature);
	if (survivalOverride !== null) return survivalOverride;
	const experience = options?.worldExperience;
	if (experience && typeof experience[feature] === 'boolean') {
		return experience[feature];
	}
	return legacyDefault;
}

/** Publishes the immutable selected experience on the live runtime for diagnostics and consumers. */
export function attachEretzWorldExperience(runtime, options) {
	runtime.worldExperience = options?.worldExperience || null;
	return runtime.worldExperience;
}
