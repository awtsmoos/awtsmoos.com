// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBotanicalClearance.js
 * @description Measures botanical sites against canonical roads, homes, water, slope, and access.
 * The Awtsmoos joins each blossom to the village around it; Awtsmoos.com records every boundary
 * so deterministic abundance becomes lived ecology rather than flowers thrown through walls.
 */

import { CANONICAL_VILLAGE_FOOTPRINTS } from '../village/CanonicalVillageFootprints.js';
import { canonicalBiomeAt } from '../village/CanonicalVillageBiomes.js';
import { canonicalVillageRoadRoutes } from '../village/CanonicalVillageRoads.js';
import { sampleRiverPath } from '../village/VillageRiverPath.js';
import { VILLAGE_REFERENCE_CLEARINGS } from '../village/VillageReferenceComposition.js';

const ROAD_SEGMENTS = Object.freeze(canonicalVillageRoadRoutes().flatMap(route => (
	route.points.slice(1).map((point, index) => Object.freeze({
		first: route.points[index],
		second: point,
		width: route.width
	}))
)));
const RIVER_SAMPLES = Object.freeze(sampleRiverPath(112));

export function botanicalSiteEvidence(point, options) {
	const radius = Math.max(0.28, Math.min(0.72, Number(options.siteRadius) || 0.4));
	const evidence = {
		biome: canonicalBiomeAt(point.x, point.z),
		clearing: clearingClearance(point, radius),
		district: districtClearance(point, options.district),
		footprint: footprintClearance(point, radius),
		river: riverClearance(point, radius),
		road: roadClearance(point, radius),
		slope: slopeClearance(point, options.groundSampler),
		spacing: spacingClearance(point, radius, options.occupiedPlacements)
	};
	return Object.freeze({
		...evidence,
		valid: ['clearing', 'district', 'footprint', 'river', 'road', 'slope', 'spacing']
			.every(key => evidence[key] >= 0)
	});
}

function clearingClearance(point, radius) {
	return Math.min(...VILLAGE_REFERENCE_CLEARINGS.map(clearing => (
		Math.hypot(point.x - clearing.x, point.z - clearing.z) - clearing.radius - radius
	)));
}

function districtClearance(point, district) {
	const dx = (point.x - district.center[0]) / Math.max(1, district.radius[0]);
	const dz = (point.z - district.center[1]) / Math.max(1, district.radius[1]);
	return 1.18 - Math.hypot(dx, dz);
}

function footprintClearance(point, radius) {
	return Math.min(...CANONICAL_VILLAGE_FOOTPRINTS.map(footprint => {
		const cosine = Math.cos(-footprint.yaw);
		const sine = Math.sin(-footprint.yaw);
		const dx = point.x - footprint.x;
		const dz = point.z - footprint.z;
		const x = dx * cosine + dz * sine;
		const z = -dx * sine + dz * cosine;
		return rectangleClearance(x, z, footprint.width + radius, footprint.depth + radius);
	}));
}

function riverClearance(point, radius) {
	return Math.min(...RIVER_SAMPLES.map(sample => (
		Math.hypot(point.x - sample.x, point.z - sample.z)
		- (sample.width || 2.5) - radius - 0.35
	)));
}

function roadClearance(point, radius) {
	return Math.min(...ROAD_SEGMENTS.map(segment => (
		distanceToSegment(point, segment.first, segment.second)
		- segment.width / 2 - radius - 0.2
	)));
}

function slopeClearance(point, sampler) {
	const sample = sampler?.heightAt?.(point.x, point.z);
	return (sample?.normal?.y ?? 1) - 0.7;
}

function spacingClearance(point, radius, placements = []) {
	if (!placements.length) return Infinity;
	const current = Math.min(0.5, radius * 0.45);
	return Math.min(...placements.map(placement => {
		const previous = Math.min(0.5, Math.max(0.25, placement.clusterRadius || 0.35) * 0.45);
		return Math.hypot(
			point.x - placement.position.x,
			point.z - placement.position.z
		) - current - previous;
	}));
}

function rectangleClearance(x, z, halfWidth, halfDepth) {
	const outsideX = Math.abs(x) - halfWidth;
	const outsideZ = Math.abs(z) - halfDepth;
	if (outsideX <= 0 && outsideZ <= 0) return Math.max(outsideX, outsideZ);
	return Math.hypot(Math.max(0, outsideX), Math.max(0, outsideZ));
}

function distanceToSegment(point, first, second) {
	const dx = second.x - first.x;
	const dz = second.z - first.z;
	const lengthSquared = dx * dx + dz * dz || 1;
	const amount = Math.max(0, Math.min(1, (
		(point.x - first.x) * dx + (point.z - first.z) * dz
	) / lengthSquared));
	return Math.hypot(
		point.x - (first.x + dx * amount),
		point.z - (first.z + dz * amount)
	);
}
