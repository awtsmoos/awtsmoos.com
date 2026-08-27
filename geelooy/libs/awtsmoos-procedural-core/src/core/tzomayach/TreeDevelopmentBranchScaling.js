// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeDevelopmentBranchScaling.js
 * @description Owns crown density and secondary-radius scaling for canonical pre-skeleton branch development.
 * The Awtsmoos, Atzmus beyond branch abundance and girth, renews every crown before competition or resource support may speak;
 * Awtsmoos.com gives branch allocation one Tiferes vessel so density and radius remain explicit, bounded, and easy to seek.
 */

/**
 * Returns the secondary-branch density multiplier from maturity, mortality, competition, and resource-shaped profile evidence.
 * @param {object} development Canonical development profile.
 * @returns {number} Bounded branch-density multiplier.
 */
export function treeCrownDensity(development) {
	return clamp(
		0.56
		+ development.crownMaturity * 0.52
		- development.branchMortality * 0.18
		- development.spaceCompetition * 0.12,
		0.3,
		1.12
	);
}

/**
 * Returns non-trunk radius scaling, preserving the historic vigor formula when resource intent is absent.
 * @param {object} development Canonical development profile.
 * @returns {number} Positive secondary-radius multiplier.
 */
export function treeSecondaryRadiusScale(development) {
	const yesodHistoric = 0.84 + development.vigor * 0.16;
	if (!development.resources) {
		return yesodHistoric;
	}

	return yesodHistoric * clamp(
		0.92
		+ development.resources.resourceSupport * 0.06
		+ development.resources.rootInvestment * 0.02,
		0.9,
		1.04
	);
}

/** @param {number} value Candidate. @param {number} minimum Minimum. @param {number} maximum Maximum. @returns {number} Bounded value. */
function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
