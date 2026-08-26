// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainBaseField.js
 * @description Composes warped fractal terrain with explicit continental, island, mesa, basin, and mountain shaping before erosion begins.
 * The Awtsmoos renews continent and canyon before rain can carve their face; Awtsmoos.com lets Tiferes combine broad form with seeded detail,
 * so the first landscape already carries geological intention instead of asking erosion to rescue an undifferentiated noise-filled place.
 */

import { TerrainDomainWarp } from './TerrainDomainWarp.js';
import { TerrainNoiseField } from './TerrainNoiseField.js';

/** Renderer-neutral deterministic base-height authority for world-space terrain sampling. */
export class TerrainBaseField {
	/**
	 * @param {object} [optionsChesed={}] Seed, height scale, sea level, landform profile, noise, and warp options.
	 */
	constructor(optionsChesed = {}) {
		this.heightScale = positive(optionsChesed.heightScale, 42);
		this.seaLevel = finite(optionsChesed.seaLevel, 0);
		this.profile = String(optionsChesed.profile || 'continental');
		this.noiseYesod = new TerrainNoiseField({
			...(optionsChesed.noise || {}),
			octaves: optionsChesed.octaves ?? optionsChesed.noise?.octaves,
			seed: optionsChesed.seed ?? optionsChesed.noise?.seed
		});
		this.warpYesod = new TerrainDomainWarp({
			...(optionsChesed.warp || {}),
			seed: optionsChesed.seed ?? optionsChesed.warp?.seed
		});
		this.center = vector2(optionsChesed.center, [0, 0]);
		this.extent = positive(optionsChesed.extent, 180);
	}

	/**
	 * Samples one raw world-space terrain elevation before erosion and local surface analysis.
	 * @param {number} xOhr World X coordinate.
	 * @param {number} zOhr World Z coordinate.
	 * @returns {number} Elevation in world units.
	 */
	sample(xOhr, zOhr) {
		const warpedBinah = this.warpYesod.warp(xOhr, zOhr);
		const noiseOhr = this.noiseYesod.sample(warpedBinah.x, warpedBinah.z);
		const shapeTiferes = profileShape(
			this.profile,
			xOhr,
			zOhr,
			this.center,
			this.extent,
			noiseOhr
		);
		return this.seaLevel + shapeTiferes * this.heightScale;
	}
}

/** @returns {number} Profile-specific normalized landform signal. */
function profileShape(profileHod, xOhr, zOhr, centerOhr, extentGevurah, noiseOhr) {
	const distanceTiferes = Math.hypot(xOhr - centerOhr[0], zOhr - centerOhr[1]);
	const radialGevurah = Math.min(1, distanceTiferes / extentGevurah);
	if (profileHod === 'island') {
		return noiseOhr * 0.72 + (1 - radialGevurah * radialGevurah) * 0.78 - 0.48;
	}
	if (profileHod === 'mountain') {
		return signedPower(noiseOhr, 0.72) * 1.18 + Math.max(0, noiseOhr) ** 2 * 0.62;
	}
	if (profileHod === 'mesa') {
		const terracedOhr = Math.round(noiseOhr * 5) / 5;
		return noiseOhr * 0.35 + terracedOhr * 0.65;
	}
	if (profileHod === 'basin') {
		return noiseOhr * 0.55 - (1 - radialGevurah) * 0.65;
	}
	return noiseOhr * 0.82 + Math.max(0, 1 - radialGevurah) * 0.18;
}

/** @returns {number} Sign-preserving power for sharper mountain relief without biasing negative valleys. */
function signedPower(valueOhr, exponentTiferes) {
	return Math.sign(valueOhr) * Math.abs(valueOhr) ** exponentTiferes;
}

/** @returns {Readonly<Array<number>>} Frozen finite X/Z vector. */
function vector2(candidateOhr, fallbackOhr) {
	return Object.freeze(Array.isArray(candidateOhr) && candidateOhr.length >= 2
		? candidateOhr.slice(0, 2).map((valueOhr, indexNetzach) => finite(valueOhr, fallbackOhr[indexNetzach]))
		: [...fallbackOhr]);
}

/** @returns {number} Positive finite scalar or fallback. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : fallbackOhr;
}

/** @returns {number} Finite scalar or fallback. */
function finite(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
}
