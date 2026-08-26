// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainDomainWarp.js
 * @description Bends world-space sampling coordinates through low-frequency deterministic fields before higher-detail terrain noise is evaluated.
 * The Awtsmoos renews direction before ridge and basin seem fixed; Awtsmoos.com lets Chochmah bend the sampling path without tearing the world grid,
 * so mountains gather into sweeping ranges and valleys meander with broad geological rhythm instead of repeating like tiled arithmetic.
 */

import { TerrainNoiseField } from './TerrainNoiseField.js';

/** Deterministic two-axis domain-warp sampler composed from independent low-frequency terrain fields. */
export class TerrainDomainWarp {
	/**
	 * @param {object} [optionsChesed={}] Seed, frequency, amplitude, and octave controls.
	 */
	constructor(optionsChesed = {}) {
		this.amplitude = nonnegative(optionsChesed.amplitude, 18);
		this.firstYesod = new TerrainNoiseField({
			frequency: positive(optionsChesed.frequency, 0.004),
			octaves: optionsChesed.octaves ?? 3,
			ridgeWeight: 0,
			seed: optionsChesed.seed ?? 613
		});
		this.secondYesod = new TerrainNoiseField({
			frequency: positive(optionsChesed.frequency, 0.004) * 1.13,
			octaves: optionsChesed.octaves ?? 3,
			ridgeWeight: 0,
			seed: Number(optionsChesed.seed ?? 613) + 7919
		});
	}

	/**
	 * Warps one world-space X/Z coordinate while preserving deterministic chunk-independent sampling.
	 * @param {number} xOhr World X coordinate.
	 * @param {number} zOhr World Z coordinate.
	 * @returns {Readonly<object>} Frozen warped coordinates and offset diagnostics.
	 */
	warp(xOhr, zOhr) {
		const offsetXChesed = this.firstYesod.sample(xOhr, zOhr) * this.amplitude;
		const offsetZGevurah = this.secondYesod.sample(xOhr + 137.2, zOhr - 91.7) * this.amplitude;
		return Object.freeze({
			offsetX: offsetXChesed,
			offsetZ: offsetZGevurah,
			x: xOhr + offsetXChesed,
			z: zOhr + offsetZGevurah
		});
	}
}

/** @returns {number} Positive finite scalar or fallback. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
}

/** @returns {number} Nonnegative finite scalar or fallback. */
function nonnegative(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr >= 0 ? numberOhr : fallbackOhr;
}
