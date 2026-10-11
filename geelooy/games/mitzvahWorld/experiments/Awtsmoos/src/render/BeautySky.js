// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BeautySky.js
 * @description Procedural sky parameters for MitzvahWorld: multi-stop dome gradient from
 * the cinematic palette, a real sun disc with warm glow, a cheap deterministic cloud
 * field (billboard instances, budgeted per quality tier), and god-ray style sun shafts
 * as additive billboards. All pure data — the renderer consumes the vessels; this module
 * owns no GL state and allocates only small per-call vessels.
 */

import { sampleBeautyPalette } from './BeautyPalette.js';
import { beautyClamp, beautyMix, createBeautyRng } from './BeautyRng.js';

/** Per-tier sky budgets: clouds and sun shafts. Shaft counts rhyme with the golden-hour lighting budgets. */
export const BEAUTY_SKY_BUDGETS = Object.freeze({
	low: Object.freeze({ clouds: 6, sunShafts: 2 }),
	medium: Object.freeze({ clouds: 12, sunShafts: 3 }),
	high: Object.freeze({ clouds: 20, sunShafts: 5 }),
	cinematic: Object.freeze({ clouds: 28, sunShafts: 9 })
});

/** Resolves a quality tier name to its sky budget (defaults to high). */
export function beautySkyBudget(quality = 'high') {
	return BEAUTY_SKY_BUDGETS[quality] || BEAUTY_SKY_BUDGETS.high;
}

const CLOUD_SEED = 'mitzvah-beauty-clouds';
const CLOUD_RING_RADIUS = 300;
const CLOUD_MIN_Y = 95;
const CLOUD_MAX_Y = 165;

/**
 * Computes a 6-stop vertical dome gradient from the palette and sun elevation.
 * Stops ascend from below-horizon haze to zenith; each stop is [elevation01, r, g, b].
 */
export function computeSkyGradient(palette, sunElevation = palette.sunElevation) {
	const zenith = palette.skyZenith;
	const horizon = palette.skyHorizon;
	const low = palette.fogColor;
	const warmth = beautyClamp(palette.warmth, 0, 1);
	const sunSide = beautyClamp(0.5 + sunElevation * 1.4, 0, 1);
	// Warm the horizon toward the sun when the sun hangs low.
	const warmHorizon = [
		beautyMix(horizon[0], Math.min(1.4, horizon[0] * 1.25 + 0.28 * warmth), sunSide * warmth),
		beautyMix(horizon[1], horizon[1] * 0.92, sunSide * warmth),
		beautyMix(horizon[2], horizon[2] * 0.78, sunSide * warmth)
	];
	return Object.freeze([
		Object.freeze([0.00, low[0] * 0.55, low[1] * 0.55, low[2] * 0.62]),
		Object.freeze([0.06, low[0], low[1], low[2]]),
		Object.freeze([0.16, warmHorizon[0], warmHorizon[1], warmHorizon[2]]),
		Object.freeze([0.38,
			beautyMix(warmHorizon[0], zenith[0], 0.55),
			beautyMix(warmHorizon[1], zenith[1], 0.55),
			beautyMix(warmHorizon[2], zenith[2], 0.55)]),
		Object.freeze([0.72, zenith[0] * 0.92, zenith[1] * 0.94, zenith[2]]),
		Object.freeze([1.00, zenith[0] * 0.72, zenith[1] * 0.78, zenith[2] * 0.94])
	]);
}

/**
 * Sun disc + glow parameters. The disc swells and reddens as the sun sinks;
 * at night the disc fades out and a small moon disc takes over.
 */
export function sunDiscParams(palette, sunElevation = palette.sunElevation) {
	const dayness = beautyClamp((sunElevation + 0.12) / 0.35, 0, 1);
	const lowness = 1 - beautyClamp((sunElevation + 0.05) / 0.5, 0, 1);
	const discAngularSize = beautyMix(0.012, 0.030, lowness);
	const glowAngularSize = beautyMix(0.10, 0.30, lowness);
	const core = dayness > 0.02 ? palette.sunColor : [0.82, 0.88, 1.0];
	const coreIntensity = beautyMix(0.0, 1.6 * palette.sunIntensity, dayness);
	const moonIntensity = dayness < 0.05 ? 0.9 : 0;
	return Object.freeze({
		discAngularSize,
		glowAngularSize,
		coreColor: Object.freeze([core[0], core[1], core[2]]),
		coreIntensity,
		glowColor: Object.freeze([
			beautyMix(core[0], 1.0, 0.35 * lowness),
			beautyMix(core[1], 0.55, 0.55 * lowness),
			beautyMix(core[2], 0.25, 0.75 * lowness)
		]),
		glowIntensity: beautyMix(0.25, 0.85, lowness) * Math.max(dayness, 0.0) + 0.05,
		haloIntensity: 0.35 * lowness * dayness,
		moonIntensity,
		isDay: dayness > 0.02
	});
}

/**
 * Deterministic cloud billboard field on a far ring. Each cloud: {x, y, z, scaleX,
 * scaleY, drift, tint, alpha}. The renderer animates x += drift * time and wraps.
 * Count is capped by the quality budget; placement never changes for a given seed.
 */
export function computeCloudField(quality = 'high', seed = CLOUD_SEED) {
	const budget = beautySkyBudget(quality);
	const rng = createBeautyRng(seed);
	const clouds = [];
	for (let i = 0; i < budget.clouds; i++) {
		const angle = rng() * Math.PI * 2;
		const radius = CLOUD_RING_RADIUS * (0.82 + rng() * 0.36);
		const scaleX = 34 + rng() * 66;
		const shade = 0.86 + rng() * 0.22;
		clouds.push(Object.freeze({
			x: Math.cos(angle) * radius,
			y: CLOUD_MIN_Y + rng() * (CLOUD_MAX_Y - CLOUD_MIN_Y),
			z: Math.sin(angle) * radius,
			scaleX,
			scaleY: scaleX * (0.24 + rng() * 0.20),
			drift: 0.6 + rng() * 1.8,
			tint: Object.freeze([shade, shade * (0.94 + rng() * 0.06), shade * (0.90 + rng() * 0.08)]),
			alpha: 0.16 + rng() * 0.22
		}));
	}
	return Object.freeze(clouds);
}

/**
 * God-ray style sun shafts: cheap additive billboards fanning from the sun disc toward
 * the ground along the sun direction. Each shaft: {tilt, length, width, color, intensity}.
 * The renderer draws them as camera-facing quads with a soft vertical falloff.
 */
export function computeSunShafts(palette, sunDirection, quality = 'high') {
	const budget = beautySkyBudget(quality);
	const elevation = palette.sunElevation;
	// Shafts read best when the sun hangs low; fade them out at high noon and at night.
	const presence = beautyClamp(1 - Math.abs(elevation - 0.28) / 0.42, 0, 1)
		* beautyClamp((elevation + 0.10) / 0.18, 0, 1);
	if (presence <= 0.01) return Object.freeze([]);
	const dir = sunDirection || [-0.45, 0.35, -0.72];
	const rng = createBeautyRng(`shafts:${palette.t.toFixed(3)}`);
	const shafts = [];
	for (let i = 0; i < budget.sunShafts; i++) {
		const spread = (rng() - 0.5) * 0.55;
		shafts.push(Object.freeze({
			direction: Object.freeze([dir[0] + spread * 0.4, dir[1], dir[2] + spread * 0.4]),
			length: 90 + rng() * 130,
			width: 6 + rng() * 16,
			tilt: spread,
			color: Object.freeze([palette.sunColor[0], palette.sunColor[1] * 0.82, palette.sunColor[2] * 0.55]),
			intensity: presence * (0.10 + rng() * 0.16)
		}));
	}
	return Object.freeze(shafts);
}

/** One-call sky vessel for the renderer: gradient, sun, clouds, shafts. */
export function computeBeautySky(timeOfDay, quality = 'high', sunDirection) {
	const palette = sampleBeautyPalette(timeOfDay);
	return Object.freeze({
		palette,
		gradient: computeSkyGradient(palette),
		sun: sunDiscParams(palette),
		clouds: computeCloudField(quality),
		shafts: computeSunShafts(palette, sunDirection, quality)
	});
}
