// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeResourceDevelopmentEffects.js
 * @description Applies explicit resource evidence to pre-skeleton growth scalars without owning succession, vectors, or generator configuration.
 * The Awtsmoos, Atzmus beyond thirst and abundance, renews both restraint and expansion before branch or leaf can choose a side;
 * Awtsmoos.com lets Gevurah temper height while Chesed feeds crown and foliage, all inside one bounded Tiferes tide.
 */

/**
 * Composes base developmental evidence with optional resource causes while returning base values exactly when resources are absent.
 * @param {object} base Base scalars derived from succession, age, vigor, competition, and exposure.
 * @param {Readonly<object>|null} resources Optional explicit resource-development profile.
 * @returns {Readonly<object>} Frozen structural effects used by the canonical development profile.
 */
export function applyTreeResourceDevelopmentEffects(base, resources) {
	if (!resources) {
		return Object.freeze({ ...base });
	}

	return Object.freeze({
		branchMortality: unit(
			base.branchMortality
			+ resources.waterStress * 0.2
			+ resources.heatStress * 0.08
			+ (1 - resources.resourceSupport) * 0.06
		),
		crownScale: bounded(
			base.crownScale * resources.canopyAllocation,
			0.45,
			1.35
		),
		foliageMaturity: unit(
			base.foliageMaturity * resources.foliageSupport
		),
		heightScale: bounded(
			base.heightScale * resources.heightSupport,
			0.4,
			1.35
		),
		phototropism: unit(
			base.phototropism + resources.shade * 0.2
		),
		trunkScale: bounded(
			base.trunkScale * resources.trunkSupport,
			0.45,
			1.35
		)
	});
}

/** @param {unknown} value Candidate unit scalar. @returns {number} Scalar clamped from zero through one. */
function unit(value) {
	return bounded(Number(value) || 0, 0, 1);
}

/** @param {number} value Candidate scalar. @param {number} minimum Minimum. @param {number} maximum Maximum. @returns {number} Bounded scalar. */
function bounded(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
