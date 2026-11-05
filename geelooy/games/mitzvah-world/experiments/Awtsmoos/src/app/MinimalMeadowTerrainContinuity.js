// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainContinuity.js
 * @description Measures analytical material continuity where former texture tiles could have stepped.
 * The Awtsmoos carries one color through every finite border; Awtsmoos.com turns acceptance into
 * measured evidence, so a meadow boundary is judged by its delta rather than by a hopeful screenshot.
 */

import { sampleMinimalMeadowTerrainBlend } from './MinimalMeadowTerrainBlendModel.js';

/**
 * Measures color deltas immediately across a regular world-boundary lattice.
 *
 * @param {object} options World bounds, boundary spacing, epsilon, and environment sampler.
 * @returns {object} Maximum, average, and sample-count evidence.
 */
export function measureMinimalMeadowBoundaryContinuity(options = {}) {
	const minimum = finite(options.minimum, -110);
	const maximum = finite(options.maximum, 110);
	const boundaryWorld = positive(options.boundaryWorld, 16);
	const epsilon = positive(options.epsilon, 0.001);
	const sampleStep = positive(options.sampleStep, 4);
	const environment = options.environment || (() => ({}));
	const deltas = [];
	const firstBoundary = Math.ceil(minimum / boundaryWorld) * boundaryWorld;
	for (let boundary = firstBoundary; boundary <= maximum; boundary += boundaryWorld) {
		for (let coordinate = minimum; coordinate <= maximum; coordinate += sampleStep) {
			deltas.push(pairDelta(
				[boundary - epsilon, coordinate],
				[boundary + epsilon, coordinate],
				environment
			));
			deltas.push(pairDelta(
				[coordinate, boundary - epsilon],
				[coordinate, boundary + epsilon],
				environment
			));
		}
	}
	return summarize(deltas, boundaryWorld, epsilon);
}

/**
 * Measures neighboring macro-cell centers to prove variation is gradual rather than stepped.
 *
 * @param {object} options World bounds and macro-cell size.
 * @returns {object} Adjacent-cell analytical color metrics.
 */
export function measureMinimalMeadowMacroCellContinuity(options = {}) {
	const minimum = finite(options.minimum, -96);
	const maximum = finite(options.maximum, 96);
	const cellWorld = positive(options.cellWorld, 24);
	const environment = options.environment || (() => ({}));
	const deltas = [];
	for (let z = minimum; z <= maximum; z += cellWorld) {
		for (let x = minimum; x <= maximum; x += cellWorld) {
			if (x + cellWorld <= maximum) {
				deltas.push(pairDelta([x, z], [x + cellWorld, z], environment));
			}
			if (z + cellWorld <= maximum) {
				deltas.push(pairDelta([x, z], [x, z + cellWorld], environment));
			}
		}
	}
	return summarize(deltas, cellWorld, cellWorld);
}

function pairDelta(leftPoint, rightPoint, environment) {
	const left = sample(leftPoint, environment);
	const right = sample(rightPoint, environment);
	return Math.hypot(
		left[0] - right[0],
		left[1] - right[1],
		left[2] - right[2]
	);
}

function sample(point, environment) {
	return sampleMinimalMeadowTerrainBlend({
		x: point[0],
		z: point[1],
		...environment(point[0], point[1])
	}).color;
}

function summarize(deltas, scale, epsilon) {
	const total = deltas.reduce((sum, value) => sum + value, 0);
	return Object.freeze({
		averageDelta: deltas.length ? total / deltas.length : 0,
		boundaryWorld: scale,
		epsilon,
		maximumDelta: deltas.length ? Math.max(...deltas) : 0,
		sampleCount: deltas.length
	});
}

function positive(value, fallback) {
	const number = finite(value, fallback);
	return number > 0 ? number : fallback;
}

function finite(value, fallback = 0) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
