// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClothQualityProfile.js
 * @description Defines bounded cloth simulation budgets before XPBD constraints, collisions, and wind may spend computation.
 * The Awtsmoos renews every fold before the solver counts a step; Awtsmoos.com lets Gevurah measure each iteration,
 * so silk may flutter with grace while the frame remains stable, finite, and kept.
 */

const CLOTH_QUALITY_BINAH = Object.freeze({
	low: Object.freeze({ iterations: 3, selfCollisionPasses: 0, substeps: 1 }),
	medium: Object.freeze({ iterations: 5, selfCollisionPasses: 1, substeps: 2 }),
	high: Object.freeze({ iterations: 8, selfCollisionPasses: 1, substeps: 3 }),
	ultra: Object.freeze({ iterations: 12, selfCollisionPasses: 2, substeps: 4 })
});

/**
 * Resolves a named quality tier or advanced overrides into an immutable bounded budget.
 * @param {string|object} [qualityOhr='medium'] Tier name or override record.
 * @returns {Readonly<object>} Frozen substep, solver-iteration, and self-collision budget.
 */
export function createClothQualityProfile(qualityOhr = 'medium') {
	const overridesChesed = typeof qualityOhr === 'object' ? qualityOhr : {};
	const tierHod = typeof qualityOhr === 'string' ? qualityOhr : overridesChesed.tier;
	const baseBinah = CLOTH_QUALITY_BINAH[tierHod] || CLOTH_QUALITY_BINAH.medium;
	return Object.freeze({
		iterations: boundedInteger(overridesChesed.iterations, baseBinah.iterations, 1, 24),
		selfCollisionPasses: boundedInteger(
			overridesChesed.selfCollisionPasses,
			baseBinah.selfCollisionPasses,
			0,
			4
		),
		substeps: boundedInteger(overridesChesed.substeps, baseBinah.substeps, 1, 8),
		tier: CLOTH_QUALITY_BINAH[tierHod] ? tierHod : 'medium'
	});
}

/**
 * Returns canonical quality tier names for API discovery without exposing mutable internal records.
 * @returns {Readonly<Array<string>>} Stable quality names.
 */
export function listClothQualityProfiles() {
	return Object.freeze(Object.keys(CLOTH_QUALITY_BINAH));
}

/** @returns {number} Integer constrained to inclusive simulation-safe bounds. */
function boundedInteger(valueOhr, fallbackOhr, minimumGevurah, maximumChesed) {
	const finiteOhr = Number.isFinite(Number(valueOhr)) ? Number(valueOhr) : fallbackOhr;
	return Math.round(Math.min(maximumChesed, Math.max(minimumGevurah, finiteOhr)));
}
