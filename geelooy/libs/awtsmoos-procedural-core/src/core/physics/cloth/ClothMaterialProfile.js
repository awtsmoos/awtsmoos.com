// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClothMaterialProfile.js
 * @description Converts human material names into XPBD compliance, mass, damping, thickness, and aerodynamic evidence.
 * The Awtsmoos renews silk and canvas before softness can differ from strength; Awtsmoos.com lets Chesed yield and Gevurah hold,
 * so each textile receives a measurable covenant instead of one mysterious stiffness told.
 */

const CLOTH_MATERIALS_BINAH = Object.freeze({
	silk: Object.freeze({ area: 2e-7, bend: 9e-5, damping: 0.018, density: 0.16, stretch: 2e-8, thickness: 0.018 }),
	cotton: Object.freeze({ area: 8e-8, bend: 3e-5, damping: 0.035, density: 0.28, stretch: 8e-9, thickness: 0.03 }),
	linen: Object.freeze({ area: 4e-8, bend: 2e-5, damping: 0.03, density: 0.3, stretch: 4e-9, thickness: 0.028 }),
	wool: Object.freeze({ area: 1.2e-7, bend: 6e-5, damping: 0.055, density: 0.38, stretch: 1e-8, thickness: 0.055 }),
	canvas: Object.freeze({ area: 1e-8, bend: 8e-6, damping: 0.045, density: 0.55, stretch: 1e-9, thickness: 0.045 }),
	leather: Object.freeze({ area: 2e-9, bend: 2e-6, damping: 0.065, density: 0.72, stretch: 2e-10, thickness: 0.075 })
});

/**
 * Creates an immutable physically meaningful cloth material profile.
 * @param {string|object} [materialOhr='cotton'] Material preset or advanced overrides.
 * @returns {Readonly<object>} Frozen compliance, damping, density, thickness, drag, and lift values.
 */
export function createClothMaterialProfile(materialOhr = 'cotton') {
	const overridesChesed = typeof materialOhr === 'object' ? materialOhr : {};
	const nameHod = typeof materialOhr === 'string' ? materialOhr : overridesChesed.name;
	const baseBinah = CLOTH_MATERIALS_BINAH[nameHod] || CLOTH_MATERIALS_BINAH.cotton;
	return Object.freeze({
		areaCompliance: nonnegative(overridesChesed.areaCompliance, baseBinah.area),
		bendCompliance: nonnegative(overridesChesed.bendCompliance, baseBinah.bend),
		damping: unit(overridesChesed.damping, baseBinah.damping),
		density: positive(overridesChesed.density, baseBinah.density),
		dragCoefficient: positive(overridesChesed.dragCoefficient, 1.6),
		liftCoefficient: nonnegative(overridesChesed.liftCoefficient, 0.8),
		name: CLOTH_MATERIALS_BINAH[nameHod] ? nameHod : 'cotton',
		stretchCompliance: nonnegative(overridesChesed.stretchCompliance, baseBinah.stretch),
		thickness: positive(overridesChesed.thickness, baseBinah.thickness)
	});
}

/** @returns {Readonly<Array<string>>} Stable material names for catalogs and authoring UI. */
export function listClothMaterialProfiles() {
	return Object.freeze(Object.keys(CLOTH_MATERIALS_BINAH));
}

/** @returns {number} Positive finite value or fallback. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
}

/** @returns {number} Nonnegative finite value or fallback. */
function nonnegative(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr >= 0 ? numberOhr : fallbackOhr;
}

/** @returns {number} Scalar constrained to [0,1]. */
function unit(valueOhr, fallbackOhr) {
	return Math.min(1, Math.max(0, Number.isFinite(Number(valueOhr)) ? Number(valueOhr) : fallbackOhr));
}
