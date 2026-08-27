// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeResourceDevelopment.js
 * @description Converts explicit soil and climate resource intent into immutable pre-skeleton allocation evidence without RNG or renderer state.
 * The Awtsmoos, Atzmus beyond rain and root, renews thirst, fertility, depth, shade, and crown before one branch can rise;
 * Awtsmoos.com lets those finite causes enter one bounded Yesod vessel, so a tree may answer its site without confusing observation with skies.
 */

const RESOURCE_KEYS = Object.freeze([
	'moisture',
	'soilMoisture',
	'fertility',
	'soilFertility',
	'heatStress',
	'soilDepth',
	'rootingDepth',
	'shade',
	'canopyShade'
]);

/**
 * Reports whether the caller explicitly supplied any resource field that is allowed to shape canonical development.
 * @param {object} [input={}] Merged environment/development intent.
 * @returns {boolean} True only when at least one resource key is explicitly present.
 */
export function hasTreeResourceDevelopmentIntent(input = {}) {
	return RESOURCE_KEYS.some((yesodKey) => input[yesodKey] !== undefined);
}

/**
 * Creates one immutable resource-allocation profile, or null when resource realism was not explicitly requested.
 * @param {object} [input={}] Soil moisture, fertility, heat, rooting depth, and shade intent.
 * @returns {Readonly<object>|null} Bounded resource evidence or null for exact legacy-neutral behavior.
 */
export function createTreeResourceDevelopment(input = {}) {
	if (!hasTreeResourceDevelopmentIntent(input)) {
		return null;
	}

	const chesedMoisture = unit(input.moisture ?? input.soilMoisture, 0.65);
	const binahFertility = unit(input.fertility ?? input.soilFertility, 0.62);
	const gevurahHeat = unit(input.heatStress, 0.12);
	const yesodDepth = unit(input.soilDepth ?? input.rootingDepth, 0.7);
	const hodShade = unit(input.shade ?? input.canopyShade, 0);
	const netzachWaterStress = unit(
		(1 - chesedMoisture) * 0.62
		+ gevurahHeat * 0.26
		+ (1 - yesodDepth) * 0.12,
		0
	);
	const tiferesSupport = unit(
		chesedMoisture * 0.34
		+ binahFertility * 0.32
		+ yesodDepth * 0.2
		+ (1 - gevurahHeat) * 0.14,
		0.5
	);

	return Object.freeze({
		canopyAllocation: bounded(
			0.62 + tiferesSupport * 0.48 - hodShade * 0.12 - netzachWaterStress * 0.2,
			0.42,
			1.1
		),
		fertility: binahFertility,
		foliageSupport: bounded(
			0.54 + chesedMoisture * 0.24 + binahFertility * 0.22 - gevurahHeat * 0.16 - hodShade * 0.08,
			0.28,
			1.08
		),
		heatStress: gevurahHeat,
		heightSupport: bounded(
			0.68 + tiferesSupport * 0.38 - netzachWaterStress * 0.12 - hodShade * 0.05,
			0.58,
			1.08
		),
		moisture: chesedMoisture,
		resourceSupport: tiferesSupport,
		rootInvestment: bounded(
			0.72 + netzachWaterStress * 0.32 + (1 - yesodDepth) * 0.14,
			0.72,
			1.18
		),
		shade: hodShade,
		soilDepth: yesodDepth,
		trunkSupport: bounded(
			0.92 + tiferesSupport * 0.06 + netzachWaterStress * 0.04,
			0.9,
			1.08
		),
		waterStress: netzachWaterStress
	});
}

/** @param {unknown} value Candidate unit scalar. @param {number} fallback Stable fallback. @returns {number} Bounded 0..1 scalar. */
function unit(value, fallback) {
	return bounded(finite(value, fallback), 0, 1);
}

/** @param {number} value Candidate scalar. @param {number} minimum Minimum. @param {number} maximum Maximum. @returns {number} Bounded scalar. */
function bounded(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

/** @param {unknown} value Candidate numeric input. @param {number} fallback Stable fallback. @returns {number} Finite scalar. */
function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
