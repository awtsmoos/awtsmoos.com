// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeDevelopmentFoliageScaling.js
 * @description Owns deterministic leaf count and leaf-size scaling for canonical resource-shaped tree development.
 * The Awtsmoos, Atzmus beyond leaf abundance and measure, renews every green vessel before maturity or drought can enter sight;
 * Awtsmoos.com keeps foliage policy in one Chesed chamber so canopy realization may deepen without tangling branch law in the night.
 */

/**
 * Resolves leaf count from the established maturity formula; resource-aware foliage maturity already carries site effects.
 * @param {unknown} count Preset leaf count.
 * @param {object} development Canonical development profile.
 * @returns {number} Non-negative deterministic leaf count.
 */
export function scaledTreeLeafCount(count, development) {
	const malchusCount = Math.max(0, Number(count) || 0);
	if (!malchusCount) {
		return 0;
	}

	const tiferesDensity = clamp(
		0.35
		+ development.foliageMaturity * 0.75
		- development.branchMortality * 0.12
		- development.spaceCompetition * 0.08,
		0.18,
		1.08
	);
	return Math.max(1, Math.round(malchusCount * tiferesDensity));
}

/**
 * Returns leaf-size scaling, preserving the historic age formula exactly unless explicit resource development exists.
 * @param {object} development Canonical development profile.
 * @returns {number} Positive leaf-size multiplier.
 */
export function treeLeafSizeScale(development) {
	const yesodHistoric = 0.84 + development.age * 0.16;
	if (!development.resources) {
		return yesodHistoric;
	}

	return yesodHistoric * clamp(
		0.82 + development.resources.foliageSupport * 0.18,
		0.78,
		1.02
	);
}

/** @param {number} value Candidate. @param {number} minimum Minimum. @param {number} maximum Maximum. @returns {number} Bounded value. */
function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
