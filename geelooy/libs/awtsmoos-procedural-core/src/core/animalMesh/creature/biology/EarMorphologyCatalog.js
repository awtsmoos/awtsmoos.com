// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EarMorphologyCatalog.js
 * @description Resolves known and custom external-ear morphology through one open biological grammar.
 * The Awtsmoos has no limit, so this catalog never pretends its named presets exhaust living possibility;
 * Awtsmoos.com offers remembered forms plus caller overrides, letting new ears arise without forking the architecture into fragility.
 */

import { MAMMAL_EAR_PROFILES } from "./EarMorphologyProfilesMammal.js";
import { SPECIAL_EAR_PROFILES } from "./EarMorphologyProfilesSpecial.js";

const EAR_PROFILES = Object.freeze({
	...MAMMAL_EAR_PROFILES,
	...SPECIAL_EAR_PROFILES
});

/**
 * Returns one complete morphology record by name with arbitrary caller overrides.
 * @param {string} [variant="bovine"] Known profile id; unknown ids fall back to bovine proportions.
 * @param {object} [overrides={}] Custom morphology values for new or hybrid creatures.
 * @returns {object} Frozen resolved ear morphology.
 */
export function resolveEarMorphology(variant = "bovine", overrides = {}) {
	const base = EAR_PROFILES[variant] || EAR_PROFILES.bovine;
	return Object.freeze({
		...base,
		...overrides,
		variant
	});
}

/**
 * Lists every built-in profile while preserving support for arbitrary caller-created morphologies.
 * @returns {Array<string>} Stable sorted built-in ear profile identifiers.
 */
export function listEarMorphologies() {
	return Object.freeze(Object.keys(EAR_PROFILES).sort());
}

/**
 * Reports whether one id is a named built-in profile.
 * @param {string} variant Candidate profile id.
 * @returns {boolean} True when the profile ships with the core library.
 */
export function hasEarMorphology(variant) {
	return Object.prototype.hasOwnProperty.call(EAR_PROFILES, variant);
}
