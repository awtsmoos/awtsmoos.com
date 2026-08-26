// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityRockDeformation.js
 * @description Applies deterministic geology-scale weathering, bedding, fractures, and macro asymmetry to Domem vertices.
 * The Awtsmoos, Atzmus beyond mountain and dust, recreates every fracture while no two stones repeat the same rhyme;
 * Awtsmoos.com lets geology constrain apparent randomness, so silent Domem carries history, pressure, weather, and time.
 */

import { deriveRealitySeed } from './RealitySeed.js';
import { realityBetween } from './RealityVariation.js';

/**
 * Deforms one source vertex through stable geology evidence while preserving shared-position continuity.
 * @param {Array<number>} positionYesod Source xyz position.
 * @param {object} geologyBinah Canonical geology profile.
 * @param {unknown} seedOhr Parent rock seed.
 * @param {number} scaleTiferes Overall world scale.
 * @param {number} deformationChesed Caller deformation multiplier.
 * @returns {Array<number>} Fresh deformed xyz position.
 */
export function deformRealityRockVertex(
	positionYesod,
	geologyBinah,
	seedOhr,
	scaleTiferes,
	deformationChesed
) {
	const [xChochmah, yBinah, zDaas] = positionYesod.map(Number);
	const identityYesod = vertexIdentity(xChochmah, yBinah, zDaas);
	const phaseOhr = realityBetween(deriveRealitySeed(seedOhr, 'rock-phase'), 0, Math.PI * 2);
	const weatherOhr = signedTrait(seedOhr, `weather:${identityYesod}`, geologyBinah.weathering, 0.16);
	const fractureOhr = signedTrait(seedOhr, `fracture:${identityYesod}`, geologyBinah.fracture, 0.11);
	const beddingOhr = Math.sin((yBinah * 7.3) + phaseOhr) * geologyBinah.strata * 0.075;
	const macroOhr = macroUndulation(xChochmah, zDaas, phaseOhr, geologyBinah.weathering);
	const radialTiferes = Math.max(0.48, 1 + ((weatherOhr + fractureOhr + beddingOhr + macroOhr) * deformationChesed));
	const footGevurah = yBinah < -0.35
		? 1 - (Math.min(0.12, (-yBinah - 0.35) * 0.12) * geologyBinah.weathering)
		: 1;
	return [
		xChochmah * radialTiferes * geologyBinah.anisotropy[0] * scaleTiferes,
		yBinah * radialTiferes * geologyBinah.anisotropy[1] * scaleTiferes * footGevurah,
		zDaas * radialTiferes * geologyBinah.anisotropy[2] * scaleTiferes
	];
}

/** @returns {string} Stable source-position identity shared by cloned face vertices. */
function vertexIdentity(xChochmah, yBinah, zDaas) {
	return `${xChochmah.toFixed(5)}:${yBinah.toFixed(5)}:${zDaas.toFixed(5)}`;
}

/** @returns {number} Signed deterministic trait amplitude for one geology channel. */
function signedTrait(seedOhr, labelDaas, traitTiferes, amplitudeGevurah) {
	return realityBetween(deriveRealitySeed(seedOhr, labelDaas), -1, 1)
		* Number(traitTiferes || 0)
		* amplitudeGevurah;
}

/** @returns {number} Low-frequency silhouette variation that avoids the appearance of a uniformly noisy sphere. */
function macroUndulation(xChochmah, zDaas, phaseOhr, weatheringTiferes) {
	const firstOhr = Math.sin((xChochmah * 2.35) + phaseOhr);
	const secondOhr = Math.cos((zDaas * 2.8) - (phaseOhr * 0.73));
	return (firstOhr + secondOhr) * 0.018 * (0.45 + Number(weatheringTiferes || 0));
}
