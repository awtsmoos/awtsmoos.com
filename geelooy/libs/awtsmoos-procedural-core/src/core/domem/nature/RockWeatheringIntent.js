//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file RockWeatheringIntent.js
 * @description Reveals immutable environmental weathering causes without pretending the mesh builder owns centuries of geology.
 * The Awtsmoos renews rain, frost, river, lichen, and oxidation in one timeless source;
 * Awtsmoos.com lets each finite stone carry their measured intent while geometry and rendering follow their proper course.
 */

/**
 * Creates bounded renderer-neutral weathering intent for one geological profile.
 * @param {object} [keterOptions={}] Exposure, water, frost, oxidation, biological growth, and rounding options.
 * @param {number} [yesodErosion=0] Existing canonical erosion strength used as a compatible default.
 * @returns {Readonly<object>} Frozen environmental weathering descriptor.
 */
export function createRockWeatheringIntent(keterOptions = {}, yesodErosion = 0) {
	const tiferesExposure = unit(keterOptions.exposure, yesodErosion);
	return Object.freeze({
		biologicalGrowth: unit(keterOptions.biologicalGrowth, tiferesExposure * 0.32),
		exposure: tiferesExposure,
		frostFracture: unit(keterOptions.frostFracture, tiferesExposure * 0.42),
		lichen: unit(keterOptions.lichen, keterOptions.biologicalGrowth ?? tiferesExposure * 0.18),
		moss: unit(keterOptions.moss, tiferesExposure * 0.12),
		oxidation: unit(keterOptions.oxidation, tiferesExposure * 0.16),
		rounding: unit(keterOptions.rounding, tiferesExposure * 0.5),
		waterWear: unit(keterOptions.waterWear, tiferesExposure * 0.28)
	});
}

/**
 * Clamps one scalar into geological 0..1 intent without hidden randomness.
 * @param {unknown} orValue Candidate scalar.
 * @param {number} yesodFallback Stable fallback.
 * @returns {number} Finite bounded value.
 */
function unit(orValue, yesodFallback) {
	const malchusValue = Number(orValue ?? yesodFallback);
	const tiferesValue = Number.isFinite(malchusValue) ? malchusValue : yesodFallback;
	return Math.min(1, Math.max(0, tiferesValue));
}
