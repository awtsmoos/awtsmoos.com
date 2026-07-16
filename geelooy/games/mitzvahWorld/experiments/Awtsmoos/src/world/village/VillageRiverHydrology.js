// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverHydrology.js
 * @description Converts the river path into one monotonically descending water profile.
 * The Awtsmoos lowers every drop toward its appointed basin; Awtsmoos.com makes the
 * source, cascades, lake waterline, and downstream outlet agree in one measured truth.
 */

import { normalBetween, villageLandmarks } from './VillageCurves.js';
import { RIVER_LAKE_T, sampleRiverPath } from './VillageRiverPath.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

export const RIVER_CASCADES = Object.freeze([
	Object.freeze({ t: 0.2, drop: 1.3 }),
	Object.freeze({ t: 0.39, drop: 1.1 }),
	Object.freeze({ t: 0.56, drop: 0.95 })
]);

export function createRiverHydrology(groundSampler, samples = 56) {
	const points = sampleRiverPath(samples).map((point) => ({ ...point }));
	const lake = villageLandmarks().lake;
	const lakeLevel = villageGroundHeight(groundSampler, lake.x, lake.z) + 0.18;
	const lakeIndex = Math.round(RIVER_LAKE_T * (points.length - 1));
	points[lakeIndex].y = lakeLevel;
	for (let index = lakeIndex - 1; index >= 0; index -= 1) {
		const point = points[index];
		const next = points[index + 1];
		const ground = villageGroundHeight(groundSampler, point.x, point.z) + 0.16;
		point.y = Math.max(ground, next.y + 0.035 + cascadeDrop(point.t, next.t));
	}
	for (let index = lakeIndex + 1; index < points.length; index += 1) {
		const point = points[index];
		const previous = points[index - 1];
		const ground = villageGroundHeight(groundSampler, point.x, point.z) + 0.14;
		point.y = Math.min(ground, previous.y - 0.045);
	}
	appendFrames(points);
	return {
		lakeIndex,
		lakeLevel,
		points,
		stats: {
			cascades: RIVER_CASCADES.length,
			lakeT: RIVER_LAKE_T,
			outletY: points.at(-1).y,
			sourceY: points[0].y,
			totalDrop: points[0].y - points.at(-1).y
		}
	};
}

export function sampleHydrologyAt(profile, t) {
	const scaled = Math.max(0, Math.min(1, t)) * (profile.points.length - 1);
	const firstIndex = Math.min(profile.points.length - 2, Math.floor(scaled));
	const amount = scaled - firstIndex;
	const first = profile.points[firstIndex];
	const second = profile.points[firstIndex + 1];
	return interpolatePoint(first, second, amount);
}

function appendFrames(points) {
	for (let index = 0; index < points.length; index += 1) {
		const previous = points[Math.max(0, index - 1)];
		const next = points[Math.min(points.length - 1, index + 1)];
		points[index].normal = normalBetween(previous, next);
	}
}

function cascadeDrop(start, end) {
	return RIVER_CASCADES.reduce((sum, cascade) => {
		return sum + (cascade.t > start && cascade.t <= end ? cascade.drop : 0);
	}, 0);
}

function interpolatePoint(first, second, amount) {
	return {
		normal: {
			x: first.normal.x + (second.normal.x - first.normal.x) * amount,
			z: first.normal.z + (second.normal.z - first.normal.z) * amount
		},
		t: first.t + (second.t - first.t) * amount,
		width: first.width + (second.width - first.width) * amount,
		x: first.x + (second.x - first.x) * amount,
		y: first.y + (second.y - first.y) * amount,
		z: first.z + (second.z - first.z) * amount
	};
}
