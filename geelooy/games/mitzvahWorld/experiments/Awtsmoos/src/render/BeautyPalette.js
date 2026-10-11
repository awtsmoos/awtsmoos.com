// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BeautyPalette.js
 * @description Time-of-day color grading for MitzvahWorld: a keyframed cinematic palette
 * (night, dawn, morning, noon, afternoon, golden, dusk) sampled by smooth interpolation.
 * The renderer feeds the sampled vessel into sky, fog, sun, water, and ambient uniforms
 * once per frame — one pure computation, no allocation, no per-frame churn.
 *
 * The golden keyframe rhymes with ReferenceGoldenHourPreset so the established late-day
 * look stays the default; the other keyframes extend it into a full living day.
 */

import { beautyClamp, beautyMix } from './BeautyRng.js';

/** Wrapped time-of-day: 0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset. */
export const BEAUTY_GOLDEN_HOUR_T = 0.78;

/**
 * Eight keyframes around the dial. Each entry: [t, skyZenith, skyHorizon, sunColor,
 * sunIntensity, fogColor, fogDensity, ambient, waterTint, exposure, warmth].
 */
const KEYFRAMES = Object.freeze([
	keyframe(0.00, [0.015, 0.03, 0.07], [0.05, 0.08, 0.16], [0.35, 0.45, 0.7], 0.12, [0.02, 0.035, 0.07], 0.016, [0.10, 0.12, 0.20], [0.03, 0.08, 0.12], 0.85, 0.05),
	keyframe(0.22, [0.25, 0.32, 0.55], [0.98, 0.55, 0.38], [1.30, 0.75, 0.45], 0.85, [0.62, 0.48, 0.44], 0.011, [0.38, 0.32, 0.34], [0.35, 0.45, 0.50], 1.18, 0.80),
	keyframe(0.32, [0.20, 0.42, 0.72], [0.62, 0.78, 0.90], [1.25, 1.05, 0.85], 1.05, [0.58, 0.66, 0.70], 0.008, [0.42, 0.44, 0.46], [0.30, 0.52, 0.55], 1.22, 0.35),
	keyframe(0.50, [0.16, 0.40, 0.75], [0.60, 0.78, 0.90], [1.30, 1.15, 0.95], 1.15, [0.56, 0.65, 0.70], 0.007, [0.44, 0.46, 0.48], [0.28, 0.52, 0.55], 1.25, 0.25),
	keyframe(0.65, [0.17, 0.38, 0.68], [0.72, 0.72, 0.78], [1.35, 1.05, 0.70], 1.10, [0.60, 0.60, 0.58], 0.008, [0.42, 0.42, 0.44], [0.32, 0.50, 0.53], 1.30, 0.45),
	keyframe(0.78, [0.19, 0.37, 0.61], [1.00, 0.57, 0.24], [1.42, 0.98, 0.62], 1.00, [0.63, 0.56, 0.49], 0.010, [0.34, 0.30, 0.31], [0.36, 0.48, 0.50], 1.44, 0.90),
	keyframe(0.88, [0.10, 0.12, 0.30], [0.85, 0.35, 0.35], [1.10, 0.55, 0.35], 0.55, [0.38, 0.28, 0.34], 0.013, [0.26, 0.22, 0.30], [0.20, 0.28, 0.36], 1.10, 0.70),
	keyframe(1.00, [0.015, 0.03, 0.07], [0.05, 0.08, 0.16], [0.35, 0.45, 0.7], 0.12, [0.02, 0.035, 0.07], 0.016, [0.10, 0.12, 0.20], [0.03, 0.08, 0.12], 0.85, 0.05)
]);

function keyframe(t, skyZenith, skyHorizon, sunColor, sunIntensity, fogColor, fogDensity, ambient, waterTint, exposure, warmth) {
	return Object.freeze({
		t, skyZenith: Object.freeze([...skyZenith]), skyHorizon: Object.freeze([...skyHorizon]),
		sunColor: Object.freeze([...sunColor]), sunIntensity, fogColor: Object.freeze([...fogColor]),
		fogDensity, ambient: Object.freeze([...ambient]), waterTint: Object.freeze([...waterTint]),
		exposure, warmth
	});
}

/** Number of palette keyframes. */
export const BEAUTY_KEYFRAME_COUNT = KEYFRAMES.length;

/** Returns the frozen keyframe list (read-only, for diagnostics). */
export function beautyKeyframes() {
	return KEYFRAMES;
}

/** Sun elevation in radians for a wrapped time-of-day: peaks at noon, dips below horizon at night. */
export function beautySunElevation(timeOfDay) {
	const t = wrapTime(timeOfDay);
	// Sunrise at 0.25, sunset at 0.75: elevation follows a sine hump between them.
	const dayT = (t - 0.25) / 0.5;
	return Math.sin(dayT * Math.PI) * 1.05 - 0.12;
}

/**
 * Samples the cinematic palette at a wrapped time-of-day in [0, 1).
 * Returns a frozen vessel: { skyZenith, skyHorizon, sunColor, sunIntensity, fogColor,
 * fogDensity, ambient, waterTint, exposure, warmth, sunElevation, t }.
 * Pure: no allocation beyond the returned vessel.
 */
export function sampleBeautyPalette(timeOfDay) {
	const t = wrapTime(timeOfDay);
	let prev = KEYFRAMES[KEYFRAMES.length - 1];
	let next = KEYFRAMES[0];
	for (let i = 0; i < KEYFRAMES.length; i++) {
		if (KEYFRAMES[i].t >= t) {
			next = KEYFRAMES[i];
			prev = i === 0 ? KEYFRAMES[KEYFRAMES.length - 1] : KEYFRAMES[i - 1];
			break;
		}
	}
	let span = next.t - prev.t;
	if (span <= 0) span += 1;
	let local = t - prev.t;
	if (local < 0) local += 1;
	const f = beautyClamp(local / span, 0, 1);
	const smooth = f * f * (3 - 2 * f);
	return Object.freeze({
		t,
		skyZenith: mix3(prev.skyZenith, next.skyZenith, smooth),
		skyHorizon: mix3(prev.skyHorizon, next.skyHorizon, smooth),
		sunColor: mix3(prev.sunColor, next.sunColor, smooth),
		sunIntensity: beautyMix(prev.sunIntensity, next.sunIntensity, smooth),
		fogColor: mix3(prev.fogColor, next.fogColor, smooth),
		fogDensity: beautyMix(prev.fogDensity, next.fogDensity, smooth),
		ambient: mix3(prev.ambient, next.ambient, smooth),
		waterTint: mix3(prev.waterTint, next.waterTint, smooth),
		exposure: beautyMix(prev.exposure, next.exposure, smooth),
		warmth: beautyMix(prev.warmth, next.warmth, smooth),
		sunElevation: beautySunElevation(t)
	});
}

/** Applies exposure + warmth grade to an rgb triple, returning a fresh triple. */
export function applyBeautyGrade(rgb, palette) {
	const exposure = palette.exposure;
	const warmth = palette.warmth * 0.12;
	return [
		beautyClamp(rgb[0] * exposure * (1 + warmth), 0, 2),
		beautyClamp(rgb[1] * exposure, 0, 2),
		beautyClamp(rgb[2] * exposure * (1 - warmth * 0.6), 0, 2)
	];
}

function wrapTime(t) {
	const value = Number(t);
	if (!Number.isFinite(value)) return BEAUTY_GOLDEN_HOUR_T;
	const wrapped = value % 1;
	return wrapped < 0 ? wrapped + 1 : wrapped;
}

function mix3(a, b, t) {
	return Object.freeze([
		beautyMix(a[0], b[0], t),
		beautyMix(a[1], b[1], t),
		beautyMix(a[2], b[2], t)
	]);
}
