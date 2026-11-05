// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BeautyWater.js
 * @description Cheap water beauty for MitzvahWorld: dual scrolling shimmer phases, a
 * sun-glint factor, shore foam driven by flow speed and shallowness, and a depth color
 * ramp. Everything is pure math; the one GLSL snippet is a handful of ALU ops (no
 * texture fetches) so it stays shader-cheap on mobile GPUs.
 */

import { beautyClamp, beautyMix } from './BeautyRng.js';

/** Budgets: foam band never exceeds this fraction of the water quad's shore axis. */
export const BEAUTY_WATER_BUDGETS = Object.freeze({
	maxFoamBand: 0.22,
	maxGlint: 1.6,
	minRipplePhase: 0,
	shimmerLayers: 2
});

/**
 * Shimmer parameters for two scrolling normal-perturb layers.
 * @param {number} timeSeconds Monotonic seconds.
 * @param {number} flowSpeed World units per second (river ~1.2, lake ~0.15).
 * @returns Frozen {scrollA:[u,v], scrollB:[u,v], ripplePhase, rippleAmplitude}.
 */
export function waterShimmerParams(timeSeconds, flowSpeed = 0.6) {
	const t = Number.isFinite(timeSeconds) ? timeSeconds : 0;
	const flow = beautyClamp(Number(flowSpeed) || 0, 0, 4);
	const speed = 0.12 + flow * 0.35;
	return Object.freeze({
		scrollA: Object.freeze([t * speed * 0.9, t * speed * 0.35]),
		scrollB: Object.freeze([-t * speed * 0.55, t * speed * 0.8]),
		ripplePhase: t * (1.1 + flow * 1.6),
		rippleAmplitude: beautyClamp(0.25 + flow * 0.45, 0.25, 1.0)
	});
}

/**
 * Blinn-Phong style sun glint for a view/sun pair (both normalized [x,y,z]).
 * Returns a 0..maxGlint scalar; cheap enough per pixel.
 */
export function waterSunGlint(viewDir, sunDir, smoothness = 64) {
	const hx = viewDir[0] + sunDir[0];
	const hy = viewDir[1] + sunDir[1];
	const hz = viewDir[2] + sunDir[2];
	const len = Math.sqrt(hx * hx + hy * hy + hz * hz) || 1;
	const nx = hx / len;
	const ny = hy / len;
	const nz = hz / len;
	// Perturbed normal leans mostly up with a hint of ripple; keep it unit-ish.
	const dot = beautyClamp(ny * 0.94 + 0.06 * (nx * 0.3 + nz * 0.3), 0, 1);
	return Math.pow(dot, smoothness) * BEAUTY_WATER_BUDGETS.maxGlint;
}

/**
 * Shore foam: stronger where water is shallow and where the current runs fast.
 * @param {number} flowSpeed World units per second.
 * @param {number} shoreDistance01 0 at the waterline, 1 deep inside.
 * @returns Frozen {foamWidth, foamIntensity, foamColor}.
 */
export function shoreFoamParams(flowSpeed = 0.6, shoreDistance01 = 0.5) {
	const flow = beautyClamp(Number(flowSpeed) || 0, 0, 4);
	const shore = beautyClamp(Number(shoreDistance01) ?? 0.5, 0, 1);
	const foamWidth = BEAUTY_WATER_BUDGETS.maxFoamBand * beautyClamp(0.35 + flow * 0.30, 0, 1);
	const edge = 1 - beautyClamp(shore / Math.max(foamWidth, 1e-4), 0, 1);
	const foamIntensity = edge * edge * beautyClamp(0.45 + flow * 0.35, 0, 1);
	return Object.freeze({
		foamWidth,
		foamIntensity,
		foamColor: Object.freeze([0.96, 0.98, 0.97])
	});
}

/**
 * Depth color ramp: shallow tint (palette waterTint warmed) to deep teal.
 * @param {number} depth01 0 at the surface edge, 1 at full depth.
 * @param {object} palette Sampled beauty palette (waterTint).
 * @returns Frozen [r, g, b].
 */
export function waterColorRamp(depth01, palette) {
	const d = beautyClamp(Number(depth01) ?? 0.5, 0, 1);
	const tint = palette?.waterTint || [0.36, 0.48, 0.50];
	const shallow = [beautyMix(tint[0], 0.62, 0.35), beautyMix(tint[1], 0.72, 0.35), beautyMix(tint[2], 0.68, 0.35)];
	const deep = [tint[0] * 0.32, tint[1] * 0.52, tint[2] * 0.58];
	const eased = d * d * (3 - 2 * d);
	return Object.freeze([
		beautyMix(shallow[0], deep[0], eased),
		beautyMix(shallow[1], deep[1], eased),
		beautyMix(shallow[2], deep[2], eased)
	]);
}

/**
 * Cheap fragment snippet: sparkle from two scrolling sine layers + shore foam band.
 * Expects uniforms: uTime, uFlowSpeed, uShoreDist (0 at waterline), uGlintColor,
 * uFoamColor, uBaseColor. ~14 ALU ops, zero texture fetches.
 */
export const BEAUTY_WATER_GLSL = `
vec2 beautyUvA = vBeautyUv * 6.0 + vec2(uTime * (0.10 + uFlowSpeed * 0.30), uTime * 0.05);
vec2 beautyUvB = vBeautyUv * 11.0 + vec2(-uTime * (0.07 + uFlowSpeed * 0.22), uTime * 0.11);
float beautyWave = sin(beautyUvA.x * 3.1 + beautyUvA.y * 1.7) * sin(beautyUvB.y * 2.3 - beautyUvA.x * 1.1);
float beautySparkle = pow(max(0.0, beautyWave), 24.0) * (0.35 + uFlowSpeed * 0.45);
float beautyFoamBand = 1.0 - smoothstep(0.0, ${'0.22'}, uShoreDist * (1.0 + uFlowSpeed * 0.4));
float beautyFoamNoise = 0.5 + 0.5 * sin(vBeautyUv.x * 90.0 + uTime * 2.0) * sin(vBeautyUv.y * 70.0 - uTime * 1.6);
vec3 beautyWater = uBaseColor + uGlintColor * beautySparkle;
beautyWater = mix(beautyWater, uFoamColor, clamp(beautyFoamBand * (0.55 + 0.45 * beautyFoamNoise), 0.0, 1.0));
`;
