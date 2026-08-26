// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterSurfaceIntent.js
 * @description Creates immutable renderer-neutral water surface meaning for beautiful shader-only water or simulation-backed hydration.
 * The Awtsmoos renews still pond, rushing river, and endless sea before motion or reflection can divide their source; Awtsmoos.com lets one surface intent carry current, wave, optics, and normal light,
 * so a simple call looks alive without a solver while advanced water may pour richer evidence into the very same vessel in sight.
 */

import { createWaterNormalDetailIntent } from './WaterNormalDetailIntent.js';
import { createWaterOpticsProfile } from './WaterOpticsProfile.js';

const SURFACE_PRESETS = Object.freeze({
	still: Object.freeze({ amplitude: 0.035, wavelength: 7.5, speed: 0.22, turbulence: 0.08 }),
	pond: Object.freeze({ amplitude: 0.055, wavelength: 5.2, speed: 0.3, turbulence: 0.16 }),
	river: Object.freeze({ amplitude: 0.09, wavelength: 3.8, speed: 0.72, turbulence: 0.42 }),
	ocean: Object.freeze({ amplitude: 0.42, wavelength: 12, speed: 0.58, turbulence: 0.52 }),
	storm: Object.freeze({ amplitude: 0.9, wavelength: 8, speed: 1.05, turbulence: 0.88 })
});

/**
 * Creates one immutable surface intent independent of geometry, simulation, renderer, and network transport.
 * @param {object} [optionsChesed={}] Material, preset, wave, current, optics, normal, time, depth, and texture options.
 * @returns {Readonly<object>} Frozen water surface intent.
 */
export function createWaterSurfaceIntent(optionsChesed = {}) {
	const presetHod = String(optionsChesed.preset || inferPreset(optionsChesed.material)).toLowerCase();
	const presetBinah = SURFACE_PRESETS[presetHod] || SURFACE_PRESETS.still;
	const waveChesed = optionsChesed.wave || {};
	return Object.freeze({
		current: Object.freeze(vector3(optionsChesed.current, [0, 0, 0])),
		depthHint: positive(optionsChesed.depthHint ?? optionsChesed.depth, 2),
		normals: createWaterNormalDetailIntent(optionsChesed.normals || {}),
		optics: createWaterOpticsProfile(
			optionsChesed.material || 'fresh',
			optionsChesed.optics || {}
		),
		preset: presetHod,
		sourceKind: String(optionsChesed.sourceKind || 'surface-only'),
		textureIntent: freezeOptionalIntent(optionsChesed.textureIntent),
		time: finite(optionsChesed.time, 0),
		type: 'water.surface-intent',
		wave: Object.freeze({
			amplitude: nonnegative(waveChesed.amplitude, presetBinah.amplitude),
			direction: Object.freeze(normalizeDirection(waveChesed.direction, [0.86, 0.51])),
			speed: nonnegative(waveChesed.speed, presetBinah.speed),
			turbulence: unit(waveChesed.turbulence, presetBinah.turbulence),
			wavelength: positive(waveChesed.wavelength, presetBinah.wavelength)
		})
	});
}

/** @returns {Readonly<Array<string>>} Stable shader-only water surface presets. */
export function listWaterSurfacePresets() {
	return Object.freeze(Object.keys(SURFACE_PRESETS));
}

/** @returns {string} Sensible motion preset inferred from canonical material family. */
function inferPreset(materialOhr) {
	const nameHod = typeof materialOhr === 'string'
		? materialOhr.toLowerCase()
		: String(materialOhr?.name || 'fresh').toLowerCase();
	if (nameHod === 'ocean') {
		return 'ocean';
	}
	if (nameHod === 'river') {
		return 'river';
	}
	if (nameHod === 'pond' || nameHod === 'muddy') {
		return 'pond';
	}
	return 'still';
}

/** @returns {Array<number>} Finite XYZ vector. */
function vector3(valueOhr, fallbackOhr) {
	const sourceOhr = Array.isArray(valueOhr)
		? valueOhr
		: [valueOhr?.x, valueOhr?.y, valueOhr?.z];
	return fallbackOhr.map((fallbackTiferes, indexNetzach) => finite(sourceOhr[indexNetzach], fallbackTiferes));
}

/** @returns {Array<number>} Safe normalized two-dimensional direction. */
function normalizeDirection(valueOhr, fallbackOhr) {
	const sourceOhr = Array.isArray(valueOhr) ? valueOhr : fallbackOhr;
	const xHod = finite(sourceOhr[0], fallbackOhr[0]);
	const zHod = finite(sourceOhr[1], fallbackOhr[1]);
	const lengthTiferes = Math.hypot(xHod, zHod);
	return lengthTiferes > 1e-9 ? [xHod / lengthTiferes, zHod / lengthTiferes] : [...fallbackOhr];
}

/** @returns {Readonly<object>|null} Frozen shallow texture evidence. */
function freezeOptionalIntent(intentKli) {
	return intentKli && typeof intentKli === 'object' ? Object.freeze({ ...intentKli }) : null;
}

/** @returns {number} Unit interval scalar. */
function unit(valueOhr, fallbackOhr) {
	return Math.min(1, Math.max(0, finite(valueOhr, fallbackOhr)));
}

/** @returns {number} Nonnegative scalar. */
function nonnegative(valueOhr, fallbackOhr) {
	return Math.max(0, finite(valueOhr, fallbackOhr));
}

/** @returns {number} Positive scalar. */
function positive(valueOhr, fallbackOhr) {
	const numberOhr = finite(valueOhr, fallbackOhr);
	return numberOhr > 0 ? numberOhr : fallbackOhr;
}

/** @returns {number} Finite scalar. */
function finite(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
}
