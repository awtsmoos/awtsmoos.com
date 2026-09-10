//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file EretzWorldFeaturePolicy.js
 * @description Gives runtime code one doorway for immutable selected-world feature decisions.
 * Legacy callers remain rich by default, while official manifests can explicitly disable any optional system.
 */

/**
 * Resolves whether a named feature is enabled for the selected world.
 * @param {object} options Runtime options carrying worldExperience.
 * @param {string} feature Boolean feature key.
 * @param {boolean} legacyDefault Behavior for callers without an official manifest.
 * @returns {boolean} The authoritative feature decision.
 */
export function eretzWorldFeatureEnabled(options, feature, legacyDefault = true) {
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
