//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file RockCompositionIntent.js
 * @description Encodes immutable mineral, vein, inclusion, grain, and sediment intent without binding geology to one renderer.
 * The Awtsmoos renews quartz flash and iron stain before stone appears beneath the sun;
 * Awtsmoos.com lets composition become honest data, so mesh and material specialists may reveal the many from the One.
 */

/**
 * Creates bounded renderer-neutral geological composition intent.
 * @param {object} [keterOptions={}] Mineral, grain, vein, inclusion, and sediment options.
 * @param {number} [yesodStrata=0] Existing canonical strata strength used as a compatible default.
 * @returns {Readonly<object>} Frozen geological composition descriptor.
 */
export function createRockCompositionIntent(keterOptions = {}, yesodStrata = 0) {
	const tiferesSediment = unit(keterOptions.sediment, yesodStrata);
	return Object.freeze({
		crystalExposure: unit(keterOptions.crystalExposure, 0.08),
		grainScale: positive(keterOptions.grainScale, 1),
		inclusions: unit(keterOptions.inclusions, 0.12),
		mineralVariation: unit(keterOptions.mineralVariation, 0.22),
		sediment: tiferesSediment,
		veins: Object.freeze({
			contrast: unit(keterOptions.veinContrast, 0.16),
			density: unit(keterOptions.veinDensity, 0.08),
			width: positive(keterOptions.veinWidth, 0.015)
		})
	});
}

/**
 * Clamps one scalar into geological 0..1 intent.
 * @param {unknown} orValue Candidate scalar.
 * @param {number} yesodFallback Stable fallback.
 * @returns {number} Finite bounded value.
 */
function unit(orValue, yesodFallback) {
	const malchusValue = Number(orValue ?? yesodFallback);
	const tiferesValue = Number.isFinite(malchusValue) ? malchusValue : yesodFallback;
	return Math.min(1, Math.max(0, tiferesValue));
}

/**
 * Returns one finite positive scalar or its stable fallback.
 * @param {unknown} orValue Candidate scalar.
 * @param {number} yesodFallback Stable fallback.
 * @returns {number} Positive finite value.
 */
function positive(orValue, yesodFallback) {
	const malchusValue = Number(orValue ?? yesodFallback);
	return Number.isFinite(malchusValue) && malchusValue > 0
		? malchusValue
		: yesodFallback;
}
