// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldEcologyClearance.js
 * @description Unifies structure, doorway, road, water, dynamic-collider, slope, and biome evidence for living placement.
 * The Awtsmoos creates forest, garden, road, river, and dwelling without collision of purpose; Awtsmoos.com gives
 * every tree and botanical caller the same signed boundaries so richer ecology cannot overwrite the village beneath it.
 */

import { canonicalBiomeAt } from '../village/CanonicalVillageBiomes.js';
import { architectureApproachEvidenceAt } from './WorldArchitectureApproach.js';
import {
	clearingExclusionEvidenceAt,
	footprintExclusionEvidenceAt
} from './WorldPhysicalExclusions.js';
import { roadCorridorEvidenceAt } from './WorldRoadCorridor.js';
import { triangleExclusionEvidenceAt } from './WorldTriangleExclusion.js';
import { waterCorridorEvidenceAt } from './WorldWaterCorridor.js';

export function ecologySiteEvidenceAt(point, options = {}) {
	const radius = Math.max(0.1, Number(options.siteRadius) || 0.4);
	const sample = options.groundSampler?.heightAt?.(point.x, point.z) || null;
	const evidence = {
		approach: clearance(architectureApproachEvidenceAt(point, {
			margin: radius + number(options.approachMargin, 0.8)
		})),
		biome: canonicalBiomeAt(point.x, point.z),
		clearing: clearance(clearingExclusionEvidenceAt(point, {
			margin: radius + number(options.clearingMargin, 0.4)
		})),
		footprint: clearance(footprintExclusionEvidenceAt(point, {
			margin: radius + number(options.footprintMargin, 0.6)
		})),
		obstacle: clearance(triangleExclusionEvidenceAt(
			point,
			options.obstacleTriangles || [],
			{ margin: radius + number(options.obstacleMargin, 0.4) }
		)),
		river: clearance(waterCorridorEvidenceAt(point, {
			hydrology: options.hydrology,
			margin: radius + number(options.waterMargin, 0.7)
		})),
		road: clearance(roadCorridorEvidenceAt(point, {
			margin: radius + number(options.roadMargin, 0.8)
		})),
		sample,
		slope: (sample?.normal?.y ?? 1) - number(options.minimumNormalY, 0.78)
	};
	const keys = ['approach', 'clearing', 'footprint', 'obstacle', 'river', 'road', 'slope'];
	return Object.freeze({
		...evidence,
		radius,
		valid: Boolean(sample && Number.isFinite(sample.y)) && keys.every(key => evidence[key] >= 0)
	});
}

export function ecologyRejectionReason(evidence) {
	if (!evidence?.sample || !Number.isFinite(evidence.sample.y)) return 'ground';
	for (const key of ['approach', 'clearing', 'footprint', 'obstacle', 'river', 'road', 'slope']) {
		if (evidence[key] < 0) return key;
	}
	return null;
}

function clearance(evidence) {
	return evidence?.clearance ?? Number.POSITIVE_INFINITY;
}

function number(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
