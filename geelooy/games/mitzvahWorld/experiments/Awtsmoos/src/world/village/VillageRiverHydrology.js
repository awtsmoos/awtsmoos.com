// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverHydrology.js
 * @description Builds one descending river with authored depth, moisture, and flow regimes.
 * The Awtsmoos lowers every drop toward its appointed basin; Awtsmoos.com joins source,
 * plunge pool, narrows, bridge reach, lower pool, and outlet in one measured covenant.
 */

import { CANONICAL_RIVER_CASCADES } from './CanonicalVillageHydrology.js';
import { normalBetween, villageLandmarks } from './VillageCurves.js';
import { riverChannelProfileAt } from './VillageRiverChannelProfile.js';
import { RIVER_LAKE_T, sampleRiverPath } from './VillageRiverPath.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

export const RIVER_CASCADES = CANONICAL_RIVER_CASCADES;

export function createRiverHydrology(groundSampler, samples = 64) {
	const points = sampleRiverPath(samples).map((point) => ({ ...point }));
	const lake = villageLandmarks().lake;
	const lakeLevel = villageGroundHeight(groundSampler, lake.x, lake.z) + 0.18;
	const lakeIndex = Math.round(RIVER_LAKE_T * (points.length - 1));
	points[lakeIndex].y = lakeLevel;

	resolveUpstreamHeights(points, lakeIndex, groundSampler);
	resolveDownstreamHeights(points, lakeIndex, groundSampler);
	appendChannelProfiles(points);
	appendFrames(points);

	const depths = points.map((point) => point.depth);
	const flowRegimes = [...new Set(points.map((point) => point.flowRegime))];

	return {
		lakeIndex,
		lakeLevel,
		points,
		stats: {
			cascades: RIVER_CASCADES.length,
			flowRegimes,
			lakeT: RIVER_LAKE_T,
			maximumDepth: Math.max(...depths),
			minimumDepth: Math.min(...depths),
			outletY: points.at(-1).y,
			sourceY: points[0].y,
			totalDrop: points[0].y - points.at(-1).y
		}
	};
}

export function sampleHydrologyAt(profile, t) {
	const scaled = clamp(t, 0, 1) * (profile.points.length - 1);
	const firstIndex = Math.min(profile.points.length - 2, Math.floor(scaled));
	const amount = scaled - firstIndex;
	return interpolatePoint(
		profile.points[firstIndex],
		profile.points[firstIndex + 1],
		amount
	);
}

function resolveUpstreamHeights(points, lakeIndex, groundSampler) {
	for (let index = lakeIndex - 1; index >= 0; index -= 1) {
		const point = points[index];
		const next = points[index + 1];
		const ground = villageGroundHeight(groundSampler, point.x, point.z) + 0.16;
		const cascade = cascadeDrop(point.t, next.t);
		const preferred = Math.max(ground, next.y + 0.04 + cascade);
		point.y = Math.min(preferred, next.y + 0.18 + cascade);
	}
}

function resolveDownstreamHeights(points, lakeIndex, groundSampler) {
	for (let index = lakeIndex + 1; index < points.length; index += 1) {
		const point = points[index];
		const previous = points[index - 1];
		const ground = villageGroundHeight(groundSampler, point.x, point.z) + 0.14;
		const preferred = Math.min(ground, previous.y - 0.04);
		point.y = Math.max(preferred, previous.y - 0.18);
	}
}

function appendChannelProfiles(points) {
	for (const point of points) {
		Object.assign(point, riverChannelProfileAt(point.t, point.width));
	}
}

function appendFrames(points) {
	for (let index = 0; index < points.length; index += 1) {
		points[index].normal = normalBetween(
			points[Math.max(0, index - 1)],
			points[Math.min(points.length - 1, index + 1)]
		);
	}
}

function cascadeDrop(start, end) {
	return RIVER_CASCADES.reduce((sum, cascade) => {
		const crossesCascade = cascade.t > start && cascade.t <= end;
		return sum + (crossesCascade ? cascade.drop : 0);
	}, 0);
}

function interpolatePoint(first, second, amount) {
	return {
		bankWetness: interpolate(first.bankWetness, second.bankWetness, amount),
		depth: interpolate(first.depth, second.depth, amount),
		flowRegime: amount < 0.5 ? first.flowRegime : second.flowRegime,
		flowSpeed: interpolate(first.flowSpeed, second.flowSpeed, amount),
		normal: {
			x: interpolate(first.normal.x, second.normal.x, amount),
			z: interpolate(first.normal.z, second.normal.z, amount)
		},
		t: interpolate(first.t, second.t, amount),
		width: interpolate(first.width, second.width, amount),
		x: interpolate(first.x, second.x, amount),
		y: interpolate(first.y, second.y, amount),
		z: interpolate(first.z, second.z, amount)
	};
}

function interpolate(first, second, amount) {
	return first + (second - first) * amount;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, Number(value) || 0));
}
