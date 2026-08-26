// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RockFormationIntent.js
 * @description Normalizes physical formation traits and derives composition/weathering defaults for the existing geology pipeline.
 * The Awtsmoos, Atzmus beyond pressure, crystal, water, and time, renews every geological cause before one stone bears its sign;
 * Awtsmoos.com turns formation into explicit data so deformation and material specialists drink from one source without crossing their line.
 */

/**
 * Resolves canonical formation traits plus caller overrides into immutable physical, composition, and weathering defaults.
 * @param {object} [base={}] Canonical formation traits from the profile catalog.
 * @param {object} [overrides={}] Expert formation-trait overrides supplied by the caller.
 * @returns {Readonly<object>} Frozen formation intent with derived composition and weathering defaults.
 */
export function createRockFormationIntent(base = {}, overrides = {}) {
	const tiferesFormation = Object.freeze({
		crystallinity: unit(overrides.crystallinity, base.crystallinity),
		family: String(overrides.family ?? base.family ?? 'weathered'),
		fragmentation: unit(overrides.fragmentation, base.fragmentation),
		grainScale: positive(overrides.grainScale, base.grainScale ?? 1),
		layering: unit(overrides.layering, base.layering),
		oxidationAffinity: unit(overrides.oxidationAffinity, base.oxidationAffinity),
		porosity: unit(overrides.porosity, base.porosity),
		rounding: unit(overrides.rounding, base.rounding),
		waterAffinity: unit(overrides.waterAffinity, base.waterAffinity)
	});

	return Object.freeze({
		...tiferesFormation,
		composition: compositionDefaults(tiferesFormation),
		weathering: weatheringDefaults(tiferesFormation)
	});
}

/**
 * Derives mineral-scale defaults that feed the existing composition normalizer and renderer-neutral material adapters.
 * @param {object} formation Normalized physical formation traits.
 * @returns {Readonly<object>} Frozen composition defaults.
 */
function compositionDefaults(formation) {
	return Object.freeze({
		crystalExposure: unit(formation.crystallinity * 0.72),
		grainScale: formation.grainScale,
		inclusions: unit(formation.fragmentation * 0.22 + formation.porosity * 0.16),
		mineralVariation: unit(0.16 + formation.crystallinity * 0.34 + formation.oxidationAffinity * 0.12),
		sediment: formation.layering,
		veinContrast: unit(formation.crystallinity * 0.34),
		veinDensity: unit(formation.crystallinity * 0.16 + formation.fragmentation * 0.06),
		veinWidth: Math.max(0.006, 0.012 + formation.grainScale * 0.004)
	});
}

/**
 * Derives environmental defaults that already influence rounding, fracture response, and directional surface deformation.
 * @param {object} formation Normalized physical formation traits.
 * @returns {Readonly<object>} Frozen weathering defaults.
 */
function weatheringDefaults(formation) {
	return Object.freeze({
		biologicalGrowth: unit(formation.waterAffinity * 0.34),
		exposure: unit(0.22 + formation.fragmentation * 0.2 + formation.porosity * 0.18),
		frostFracture: unit(formation.fragmentation * 0.52 + formation.porosity * 0.22),
		lichen: unit(formation.waterAffinity * 0.3),
		moss: unit(formation.waterAffinity * 0.2),
		oxidation: unit(formation.oxidationAffinity * 0.58),
		rounding: formation.rounding,
		waterWear: unit(formation.waterAffinity * 0.58 + formation.rounding * 0.22)
	});
}

/** @param {unknown} value Candidate scalar. @param {unknown} fallback Fallback scalar. @returns {number} Bounded 0..1 scalar. */
function unit(value, fallback = 0) {
	const malchusValue = Number(value ?? fallback ?? 0);
	return Number.isFinite(malchusValue)
		? Math.min(1, Math.max(0, malchusValue))
		: 0;
}

/** @param {unknown} value Candidate positive scalar. @param {number} fallback Fallback scalar. @returns {number} Positive finite scalar. */
function positive(value, fallback) {
	const malchusValue = Number(value ?? fallback);
	return Number.isFinite(malchusValue) && malchusValue > 0
		? malchusValue
		: fallback;
}
