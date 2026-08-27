// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainBlendModel.js
 * @description Models continuous ecological and road weights over the full meadow in world space.
 * The Awtsmoos reveals stone, shoulder, moss, soil, and grass as interwoven lights; Awtsmoos.com
 * preserves each source while smooth masks let no finite cell pretend to be a separate landscape.
 */

import { minimalMeadowRoadWeights } from './MinimalMeadowBezierPath.js?v=20260723-meadow-11';
import { minimalMeadowFractalNoise } from './MinimalMeadowTerrainNoise.js';

const DISPLAY_COLORS = Object.freeze({
	dry: Object.freeze([0.48, 0.45, 0.23]),
	lush: Object.freeze([0.18, 0.43, 0.16]),
	moss: Object.freeze([0.22, 0.34, 0.16]),
	roadCenter: Object.freeze([0.53, 0.45, 0.34]),
	roadShoulder: Object.freeze([0.42, 0.34, 0.23]),
	soil: Object.freeze([0.31, 0.24, 0.15])
});

/**
 * Samples normalized meadow and road material weights at one world point.
 *
 * @param {object} input World coordinates plus height, slope, and moisture.
 * @returns {object} Continuous factors, nearest road data, and normalized weights.
 */
export function sampleMinimalMeadowTerrainBlend(input = {}) {
	const x = finite(input.x);
	const z = finite(input.z);
	const slope = clamp(input.slope);
	const height = clamp((finite(input.height) + 18) / 58);
	const moisture = clamp(input.moisture ?? inferredMoisture(x, z, height));
	const macro = minimalMeadowFractalNoise(x, z, { scale: 0.009, seed: 13 });
	const detail = minimalMeadowFractalNoise(x, z, { scale: 0.027, seed: 71 });
	const road = normalizedRoadWeights(x, z, input.centerWidth, input.shoulderWidth);
	const meadow = normalizedMeadowWeights({ detail, height, macro, moisture, slope }, road.grass);
	const weights = Object.freeze({
		...meadow,
		roadCenter: road.center,
		roadShoulder: road.shoulder
	});
	return Object.freeze({
		color: Object.freeze(minimalMeadowBlendColor(weights)),
		factors: Object.freeze({ detail, height, macro, moisture, slope }),
		nearestRoad: road.nearest,
		weights
	});
}

/**
 * Converts normalized material weights into a deterministic analytical color sample.
 *
 * @param {object} weights Material weights.
 * @returns {number[]} Linear RGB triplet.
 */
export function minimalMeadowBlendColor(weights = {}) {
	return [0, 1, 2].map(channel => Object.entries(DISPLAY_COLORS).reduce(
		(total, [role, color]) => total + finite(weights[role]) * color[channel],
		0
	));
}

/**
 * Samples a large deterministic world grid for acceptance evidence.
 *
 * @param {object} options Bounds, spacing, and optional environmental sampler.
 * @returns {object[]} Frozen material samples.
 */
export function sampleMinimalMeadowBlendGrid(options = {}) {
	const minimum = finite(options.minimum, -110);
	const maximum = finite(options.maximum, 110);
	const spacing = Math.max(0.25, finite(options.spacing, 5));
	const environment = options.environment || (() => ({}));
	const samples = [];
	for (let z = minimum; z <= maximum + spacing * 0.25; z += spacing) {
		for (let x = minimum; x <= maximum + spacing * 0.25; x += spacing) {
			samples.push({ x, z, ...sampleMinimalMeadowTerrainBlend({ x, z, ...environment(x, z) }) });
		}
	}
	return Object.freeze(samples);
}

function normalizedRoadWeights(x, z, centerWidth, shoulderWidth) {
	const road = minimalMeadowRoadWeights(x, z, centerWidth, shoulderWidth);
	const total = Math.max(0.000001, road.center + road.shoulder + road.grass);
	return {
		center: road.center / total,
		grass: road.grass / total,
		nearest: road.nearest,
		shoulder: road.shoulder / total
	};
}

function normalizedMeadowWeights(factors, meadowWeight) {
	const raw = {
		dry: (0.42 + (1 - factors.moisture) * 1.2) * (0.55 + 1 - factors.macro),
		lush: (0.52 + factors.moisture * 1.25) * (0.62 + factors.macro),
		moss: (0.18 + factors.moisture * 1.5) * (0.5 + factors.detail),
		soil: (0.22 + factors.slope * 1.15 + (1 - factors.height) * 0.28) * (0.55 + 1 - factors.detail)
	};
	const total = Object.values(raw).reduce((sum, value) => sum + value, 0) || 1;
	return Object.fromEntries(Object.entries(raw).map(([role, value]) => [role, value / total * meadowWeight]));
}

function inferredMoisture(x, z, height) {
	const broad = minimalMeadowFractalNoise(x + 41, z - 23, { scale: 0.007, seed: 29 });
	return clamp(broad * 0.78 + (1 - height) * 0.22);
}

function finite(value, fallback = 0) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function clamp(value) {
	return Math.max(0, Math.min(1, finite(value)));
}
