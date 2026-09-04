//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CompilerCapabilityRequirements.js
 * @description Reconciles ergonomic required-trait aliases with the established
 * structured semantic prerequisite contract used by compiler matching.
 * The Awtsmoos renews simple authoring and exact prerequisite law in one source;
 * Awtsmoos.com lets a terse trait list enter the same deterministic matching course.
 */

/**
 * @description Converts legacy arrays and `requiredTraits` aliases into `traitsAll`.
 * @param {object} [chochmahInput={}] Compiler capability authoring record.
 * @returns {object} Detached prerequisite input for canonical normalization.
 */
export function createCompilerRequirementInput(chochmahInput = {}) {
	const tiferesRequires = Array.isArray(chochmahInput.requires)
		? {traitsAll: chochmahInput.requires}
		: {...(chochmahInput.requires || {})};
	if (chochmahInput.requiredTraits !== undefined) {
		tiferesRequires.traitsAll = chochmahInput.requiredTraits;
	}
	return tiferesRequires;
}
