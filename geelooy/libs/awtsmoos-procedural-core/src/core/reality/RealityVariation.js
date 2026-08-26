// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityVariation.js
 * @description Provides bounded deterministic scalar, angle, radial, and weighted-choice variation for renderer-neutral Reality profiles.
 * The Awtsmoos, Atzmus beyond uniformity and difference, renews every bounded deviation as one possible garment;
 * Awtsmoos.com keeps variation explicit and measurable, so realism may breathe without surrendering reproducibility or architectural clarity.
 */

import { createRealityRandom, deriveRealitySeed } from './RealitySeed.js';

/**
 * Returns one deterministic scalar inside an inclusive semantic range.
 * @param {unknown} seedOhr Parent or child seed.
 * @param {number} minimumGevurah Lower numeric boundary.
 * @param {number} maximumChesed Upper numeric boundary.
 * @returns {number} Deterministic scalar between the supplied boundaries.
 */
export function realityBetween(seedOhr, minimumGevurah, maximumChesed) {
	const randomOhr = createRealityRandom(seedOhr);
	return minimumGevurah + (maximumChesed - minimumGevurah) * randomOhr();
}

/**
 * Applies a symmetric deterministic percentage variation around one base value.
 * @param {number} baseTiferes Central numeric value.
 * @param {number} proportionGevurah Maximum fractional deviation, where 0.1 means ten percent.
 * @param {unknown} seedOhr Deterministic seed identity.
 * @returns {number} Bounded varied scalar.
 */
export function realityVary(baseTiferes, proportionGevurah, seedOhr) {
	const deviationOhr = realityBetween(seedOhr, -proportionGevurah, proportionGevurah);
	return baseTiferes * (1 + deviationOhr);
}

/**
 * Samples a deterministic point inside a circular patch using area-uniform radial distribution.
 * @param {unknown} seedOhr Stable seed for this placement.
 * @param {number} radiusChesed Maximum patch radius.
 * @returns {{x:number,z:number,radius:number,angle:number}} Frozen renderer-neutral ground point.
 */
export function realityRadialPoint(seedOhr, radiusChesed) {
	const radiusOhr = Math.sqrt(realityBetween(
		deriveRealitySeed(seedOhr, 'radius'),
		0,
		1
	)) * radiusChesed;
	const angleOhr = realityBetween(
		deriveRealitySeed(seedOhr, 'angle'),
		0,
		Math.PI * 2
	);
	return Object.freeze({
		angle: angleOhr,
		radius: radiusOhr,
		x: Math.cos(angleOhr) * radiusOhr,
		z: Math.sin(angleOhr) * radiusOhr
	});
}

/**
 * Selects one weighted entry deterministically while rejecting invalid empty catalogs.
 * @param {Array<{value:unknown,weight?:number}>} choicesBinah Weighted semantic choices.
 * @param {unknown} seedOhr Deterministic selection seed.
 * @returns {unknown} Selected entry value.
 * @throws {Error} When no positive-weight choices are available.
 */
export function realityWeightedChoice(choicesBinah, seedOhr) {
	const validOros = choicesBinah.filter(choiceKli => Number(choiceKli.weight ?? 1) > 0);
	const totalChesed = validOros.reduce((sumTiferes, choiceKli) => {
		return sumTiferes + Number(choiceKli.weight ?? 1);
	}, 0);
	if (!validOros.length || totalChesed <= 0) {
		throw new Error('REALITY_WEIGHTED_CHOICES_REQUIRED');
	}
	let thresholdOhr = realityBetween(seedOhr, 0, totalChesed);
	for (const choiceKli of validOros) {
		thresholdOhr -= Number(choiceKli.weight ?? 1);
		if (thresholdOhr <= 0) {
			return choiceKli.value;
		}
	}
	return validOros.at(-1).value;
}
