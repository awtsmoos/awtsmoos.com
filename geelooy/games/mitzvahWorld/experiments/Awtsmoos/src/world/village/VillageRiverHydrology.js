// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverHydrology.js
 * @description Builds one descending river with authored depth, moisture, flow regimes, and stable channel frames.
 * The Awtsmoos lowers every drop toward its appointed basin; Awtsmoos.com joins source, plunge pool,
 * narrows, bridge reach, lower pool, and outlet while interpolation lives in its own focused river vessel.
 */

import { CANONICAL_RIVER_CASCADES } from './CanonicalVillageHydrology.js';
import { normalBetween, villageLandmarks } from './VillageCurves.js';
import { riverChannelProfileAt } from './VillageRiverChannelProfile.js';
import { sampleHydrologyPoint } from './VillageRiverHydrologySampling.js';
import { RIVER_LAKE_T, sampleRiverPath } from './VillageRiverPath.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

export const RIVER_CASCADES = CANONICAL_RIVER_CASCADES;

export function createRiverHydrology(groundSampler, samples = 64) {
	const points = sampleRiverPath(samples).map(point => ({ ...point }));
	const lake = villageLandmarks().lake;
	const lakeLevel = villageGroundHeight(groundSampler, lake.x, lake.z) + 0.18;
	const lakeIndex = Math.round(RIVER_LAKE_T * (points.length - 1));
	points[lakeIndex].y = lakeLevel;
	resolveUpstreamHeights(points, lakeIndex, groundSampler);
	resolveDownstreamHeights(points, lakeIndex, groundSampler);
	appendChannelProfiles(points);
	appendFrames(points);
	const depths = points.map(point => point.depth);
	return {
		lakeIndex,
		lakeLevel,
		points,
		stats: {
			cascades: RIVER_CASCADES.length,
			flowRegimes: [...new Set(points.map(point => point.flowRegime))],
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
	return sampleHydrologyPoint(profile.points, t);
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
	for (const point of points) Object.assign(point, riverChannelProfileAt(point.t, point.width));
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
		return sum + (cascade.t > start && cascade.t <= end ? cascade.drop : 0);
	}, 0);
}
