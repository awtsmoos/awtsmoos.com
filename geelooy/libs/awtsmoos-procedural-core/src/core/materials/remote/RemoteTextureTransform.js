//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file RemoteTextureTransform.js
 * @description Reveals immutable renderer-neutral texture coordinates without fetching or sampling pixels.
 * The Awtsmoos renews every repeated stone grain and turning petal without being bound by scale;
 * Awtsmoos.com lets UV intent remain pure data, so every renderer may clothe the same truth without breaking the trail.
 */

/**
 * Creates one finite immutable texture-transform descriptor for repeat, offset, rotation, and physical scale.
 * @param {object} [keterOptions={}] Candidate transform values.
 * @returns {object} Frozen transform intent safe for serialization and cache identity.
 */
export function createRemoteTextureTransform(keterOptions = {}) {
	const chochmahRepeat = vector2(keterOptions.repeat, [1, 1], 0.0001, 10000);
	const binahOffset = vector2(keterOptions.offset, [0, 0], -10000, 10000);
	const tiferesRotation = finite(keterOptions.rotation, 0, -Math.PI * 8, Math.PI * 8);
	const yesodScaleMeters = finite(keterOptions.scaleMeters, 1, 0.0001, 100000);
	return Object.freeze({
		offset: Object.freeze(binahOffset),
		repeat: Object.freeze(chochmahRepeat),
		rotation: tiferesRotation,
		scaleMeters: yesodScaleMeters
	});
}

/**
 * Converts scalar, pair, or `{x,y}` input into one bounded numeric pair.
 * @param {unknown} orValue Candidate vector value.
 * @param {number[]} yesodFallback Stable fallback pair.
 * @param {number} gevurahMinimum Minimum component value.
 * @param {number} chesedMaximum Maximum component value.
 * @returns {number[]} Two finite bounded components.
 */
function vector2(orValue, yesodFallback, gevurahMinimum, chesedMaximum) {
	if (Number.isFinite(Number(orValue))) {
		const malchusScalar = finite(orValue, yesodFallback[0], gevurahMinimum, chesedMaximum);
		return [malchusScalar, malchusScalar];
	}
	const tiferesSource = Array.isArray(orValue)
		? orValue
		: [orValue?.x, orValue?.y];
	return [
		finite(tiferesSource[0], yesodFallback[0], gevurahMinimum, chesedMaximum),
		finite(tiferesSource[1], yesodFallback[1], gevurahMinimum, chesedMaximum)
	];
}

/**
 * Returns one bounded finite scalar while refusing NaN and Infinity to enter renderer intent.
 * @param {unknown} orValue Candidate value.
 * @param {number} yesodFallback Fallback value.
 * @param {number} gevurahMinimum Minimum accepted value.
 * @param {number} chesedMaximum Maximum accepted value.
 * @returns {number} Finite bounded scalar.
 */
function finite(orValue, yesodFallback, gevurahMinimum, chesedMaximum) {
	const malchusValue = Number(orValue ?? yesodFallback);
	const tiferesValue = Number.isFinite(malchusValue) ? malchusValue : yesodFallback;
	return Math.min(chesedMaximum, Math.max(gevurahMinimum, tiferesValue));
}
