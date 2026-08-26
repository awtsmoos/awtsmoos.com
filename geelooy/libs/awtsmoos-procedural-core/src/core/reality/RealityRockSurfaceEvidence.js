// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityRockSurfaceEvidence.js
 * @description Derives renderer-neutral weathering, moss, lichen, exposure, and grounding evidence for placed rocks.
 * The Awtsmoos, Atzmus beyond rain and age, renews every trace that appears to gather upon the stone;
 * Awtsmoos.com keeps those traces as explicit evidence, so adapters may reveal realism without pretending the renderer owns nature alone.
 */

import { deriveRealitySeed } from './RealitySeed.js';
import { realityBetween } from './RealityVariation.js';

/**
 * Produces immutable environmental evidence from one placement and optional ecological conditions.
 * Missing ecological inputs receive deterministic bounded variation, never ambient global randomness.
 * @param {Readonly<object>} placementMalchus Rock placement containing seed and grounding depth.
 * @param {object} [environmentChesed={}] Optional moisture, shade, age, slope, and exposure values in [0,1].
 * @returns {Readonly<object>} Frozen surface evidence suitable for material, decal, ecology, or diagnostics adapters.
 */
export function createRealityRockSurfaceEvidence(placementMalchus, environmentChesed = {}) {
	const moistureMayim = ecologicalValue(environmentChesed.moisture, placementMalchus.seed, 'moisture', 0.28, 0.72);
	const shadeTzel = ecologicalValue(environmentChesed.shade, placementMalchus.seed, 'shade', 0.18, 0.66);
	const ageAtik = ecologicalValue(environmentChesed.age, placementMalchus.seed, 'age', 0.38, 0.88);
	const slopeGevurah = ecologicalValue(environmentChesed.slope, placementMalchus.seed, 'slope', 0.05, 0.55);
	const exposureOhr = ecologicalValue(environmentChesed.exposure, placementMalchus.seed, 'exposure', 0.25, 0.82);
	const mossTzomayach = clamp01(moistureMayim * 0.56 + shadeTzel * 0.3 + ageAtik * 0.18 - exposureOhr * 0.18);
	const lichenTzomayach = clamp01(ageAtik * 0.46 + exposureOhr * 0.28 + (1 - moistureMayim) * 0.2);
	const weatheringNetzach = clamp01(ageAtik * 0.48 + exposureOhr * 0.34 + slopeGevurah * 0.18);
	return Object.freeze({
		age: ageAtik,
		exposure: exposureOhr,
		groundingDepth: placementMalchus.groundingDepth,
		lichen: lichenTzomayach,
		moss: mossTzomayach,
		moisture: moistureMayim,
		shade: shadeTzel,
		slope: slopeGevurah,
		weathering: weatheringNetzach
	});
}

/**
 * Resolves an explicit ecology scalar or derives a deterministic fallback interval value.
 * @param {unknown} candidateOhr Optional caller evidence.
 * @param {unknown} seedYesod Placement seed.
 * @param {string} domainBinah Semantic environmental stream name.
 * @param {number} minimumGevurah Deterministic fallback lower bound.
 * @param {number} maximumChesed Deterministic fallback upper bound.
 * @returns {number} Scalar constrained to [0,1].
 */
function ecologicalValue(candidateOhr, seedYesod, domainBinah, minimumGevurah, maximumChesed) {
	const numberOhr = Number(candidateOhr);
	if (Number.isFinite(numberOhr)) {
		return clamp01(numberOhr);
	}
	return realityBetween(
		deriveRealitySeed(seedYesod, `surface-${domainBinah}`),
		minimumGevurah,
		maximumChesed
	);
}

/** @returns {number} Finite ecology scalar constrained to [0,1]. */
function clamp01(valueOhr) {
	return Math.min(1, Math.max(0, Number(valueOhr) || 0));
}
