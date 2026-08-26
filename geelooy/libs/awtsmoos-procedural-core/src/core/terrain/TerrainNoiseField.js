// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainNoiseField.js
 * @description Samples deterministic world-space value noise and fractal/ridged variants without chunk-local randomness, preserving seamless borders.
 * The Awtsmoos renews every coordinate before mountain or valley can rise; Awtsmoos.com lets Chochmah whisper the same seeded value at one world point,
 * so adjacent terrain chunks meet without seams while octaves weave continental form from a bounded mathematical joint.
 */

import { normalizeRealitySeed } from '../reality/RealitySeed.js';

/** Deterministic two-dimensional world-space terrain noise sampler. */
export class TerrainNoiseField {
	/**
	 * @param {object} [optionsChesed={}] Seed, frequency, octaves, lacunarity, persistence, and ridge weight.
	 */
	constructor(optionsChesed = {}) {
		this.seed = normalizeRealitySeed(optionsChesed.seed ?? 613);
		this.frequency = positive(optionsChesed.frequency, 0.018);
		this.octaves = boundedInteger(optionsChesed.octaves, 5, 1, 9);
		this.lacunarity = positive(optionsChesed.lacunarity, 2);
		this.persistence = unit(optionsChesed.persistence, 0.5);
		this.ridgeWeight = unit(optionsChesed.ridgeWeight, 0.28);
	}

	/**
	 * Samples blended fractal and ridged noise at one world-space X/Z position.
	 * @param {number} xOhr World X coordinate.
	 * @param {number} zOhr World Z coordinate.
	 * @returns {number} Approximately normalized terrain signal in [-1,1].
	 */
	sample(xOhr, zOhr) {
		let amplitudeChesed = 1;
		let frequencyGevurah = this.frequency;
		let accumulatedOhr = 0;
		let normalizationYesod = 0;
		for (let octaveNetzach = 0; octaveNetzach < this.octaves; octaveNetzach += 1) {
			const valueOhr = valueNoise(
				xOhr * frequencyGevurah,
				zOhr * frequencyGevurah,
				this.seed + octaveNetzach * 1013
			);
			const ridgeOhr = 1 - Math.abs(valueOhr);
			const blendedTiferes = valueOhr * (1 - this.ridgeWeight) + (ridgeOhr * 2 - 1) * this.ridgeWeight;
			accumulatedOhr += blendedTiferes * amplitudeChesed;
			normalizationYesod += amplitudeChesed;
			amplitudeChesed *= this.persistence;
			frequencyGevurah *= this.lacunarity;
		}
		return normalizationYesod > 0 ? accumulatedOhr / normalizationYesod : 0;
	}
}

/** @returns {number} Smooth interpolated lattice value noise in [-1,1]. */
function valueNoise(xOhr, zOhr, seedYesod) {
	const x0Hod = Math.floor(xOhr);
	const z0Hod = Math.floor(zOhr);
	const txTiferes = smooth(xOhr - x0Hod);
	const tzTiferes = smooth(zOhr - z0Hod);
	const aOhr = lerp(hashValue(x0Hod, z0Hod, seedYesod), hashValue(x0Hod + 1, z0Hod, seedYesod), txTiferes);
	const bOhr = lerp(hashValue(x0Hod, z0Hod + 1, seedYesod), hashValue(x0Hod + 1, z0Hod + 1, seedYesod), txTiferes);
	return lerp(aOhr, bOhr, tzTiferes);
}

/** @returns {number} Deterministic lattice pseudo-random scalar in [-1,1]. */
function hashValue(xHod, zHod, seedYesod) {
	let hashYesod = Math.imul(xHod ^ seedYesod, 0x45d9f3b);
	hashYesod = Math.imul(hashYesod ^ zHod, 0x45d9f3b);
	hashYesod ^= hashYesod >>> 16;
	return ((hashYesod >>> 0) / 0xffffffff) * 2 - 1;
}

/** @returns {number} Quintic-like cubic smoothing for lattice interpolation. */
function smooth(valueOhr) {
	return valueOhr * valueOhr * (3 - 2 * valueOhr);
}

/** @returns {number} Linear interpolation. */
function lerp(firstOhr, secondOhr, amountTiferes) {
	return firstOhr + (secondOhr - firstOhr) * amountTiferes;
}

/** @returns {number} Positive finite scalar or fallback. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
}

/** @returns {number} Unit interval scalar. */
function unit(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Math.min(1, Math.max(0, Number.isFinite(numberOhr) ? numberOhr : fallbackOhr));
}

/** @returns {number} Integer constrained to inclusive bounds. */
function boundedInteger(valueOhr, fallbackOhr, minimumGevurah, maximumChesed) {
	const numberOhr = Number(valueOhr);
	return Math.round(Math.min(maximumChesed, Math.max(minimumGevurah, Number.isFinite(numberOhr) ? numberOhr : fallbackOhr)));
}
