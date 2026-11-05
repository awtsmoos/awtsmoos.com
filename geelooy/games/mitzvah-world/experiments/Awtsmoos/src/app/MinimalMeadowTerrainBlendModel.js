// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainBlendModel.js
 * @description Samples normalized road and meadow material weights across the continuous world.
 * The Awtsmoos reveals stone, shoulder, moss, soil, dry earth, and grass as one interwoven field;
 * Awtsmoos.com preserves analytical color, grid evidence, and renderer-independent ecological factors.
 */

import { minimalMeadowRoadWeights } from './MinimalMeadowBezierPath.js?v=20260723-meadow-11';
import {
	minimalMeadowInferredMoisture,
	minimalMeadowNormalizedWeights,
	minimalMeadowTerrainFields
} from './MinimalMeadowTerrainBlendFields.js';

const DISPLAY_COLORS = Object.freeze({
	dry: Object.freeze([0.5, 0.45, 0.22]),
	lush: Object.freeze([0.16, 0.44, 0.14]),
	moss: Object.freeze([0.2, 0.35, 0.14]),
	roadCenter: Object.freeze([0.53, 0.45, 0.34]),
	roadShoulder: Object.freeze([0.4, 0.32, 0.21]),
	soil: Object.freeze([0.31, 0.23, 0.14])
});

export function sampleMinimalMeadowTerrainBlend(input = {}) {
	const x = finite(input.x);
	const z = finite(input.z);
	const slope = clamp(input.slope);
	const height = clamp((finite(input.height) + 18) / 58);
	const fields = minimalMeadowTerrainFields(x, z);
	const moisture = clamp(
		input.moisture ?? minimalMeadowInferredMoisture(fields, height)
	);
	const road = normalizedRoadWeights(
		x,
		z,
		input.centerWidth,
		input.shoulderWidth
	);
	const meadow = minimalMeadowNormalizedWeights({
		...fields,
		height,
		moisture,
		slope
	}, road.grass);
	const weights = Object.freeze({
		...meadow,
		roadCenter: road.center,
		roadShoulder: road.shoulder
	});
	return Object.freeze({
		color: Object.freeze(minimalMeadowBlendColor(weights)),
		factors: Object.freeze({ ...fields, height, moisture, slope }),
		nearestRoad: road.nearest,
		weights
	});
}

export function minimalMeadowBlendColor(weights = {}) {
	return [0, 1, 2].map(channel => Object.entries(DISPLAY_COLORS).reduce(
		(total, [role, color]) => total + finite(weights[role]) * color[channel],
		0
	));
}

export function sampleMinimalMeadowBlendGrid(options = {}) {
	const minimum = finite(options.minimum, -110);
	const maximum = finite(options.maximum, 110);
	const spacing = Math.max(0.25, finite(options.spacing, 5));
	const environment = options.environment || (() => ({}));
	const samples = [];
	for (let z = minimum; z <= maximum + spacing * 0.25; z += spacing) {
		for (let x = minimum; x <= maximum + spacing * 0.25; x += spacing) {
			samples.push({
				x,
				z,
				...sampleMinimalMeadowTerrainBlend({
					x,
					z,
					...environment(x, z)
				})
			});
		}
	}
	return Object.freeze(samples);
}

function normalizedRoadWeights(x, z, centerWidth, shoulderWidth) {
	const road = minimalMeadowRoadWeights(x, z, centerWidth, shoulderWidth);
	const total = Math.max(
		0.000001,
		road.center + road.shoulder + road.grass
	);
	return {
		center: road.center / total,
		grass: road.grass / total,
		nearest: road.nearest,
		shoulder: road.shoulder / total
	};
}

function finite(value, fallback = 0) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function clamp(value) {
	return Math.max(0, Math.min(1, finite(value)));
}
