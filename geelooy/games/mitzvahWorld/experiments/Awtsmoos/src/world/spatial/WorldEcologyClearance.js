// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldEcologyClearance.js
 * @description Unifies structure, doorway, road, water, obstacle, slope, biome, and ground evidence for living placement.
 * The Awtsmoos creates forest, garden, road, river, and dwelling without collision of purpose or divided ground lore;
 * Awtsmoos.com lets numeric and structured samplers enter one vessel, while every signed boundary guards the same world door.
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

/**
 * Measures one ecological site against every shared physical exclusion.
 * @param {{x:number,z:number}} point Candidate world position.
 * @param {object} [options={}] Clearance policy and ground-sampler inputs.
 * @returns {Readonly<object>} Signed evidence plus normalized ground sample and validity.
 */
export function ecologySiteEvidenceAt(point, options = {}) {
	const radius = Math.max(0.1, Number(options.siteRadius) || 0.4);
	const sample = sampleGround(options.groundSampler, point.x, point.z);
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

/** Returns the first failing ecology channel, or null when all measured gates pass. */
export function ecologyRejectionReason(evidence) {
	if (!evidence?.sample || !Number.isFinite(evidence.sample.y)) return 'ground';
	for (const key of ['approach', 'clearing', 'footprint', 'obstacle', 'river', 'road', 'slope']) {
		if (evidence[key] < 0) return key;
	}
	return null;
}

/** Normalizes supported numeric-function and structured heightAt samplers into one sample shape. */
function sampleGround(groundSampler, x, z) {
	const raw = typeof groundSampler === 'function'
		? groundSampler(x, z)
		: groundSampler?.heightAt?.(x, z);
	if (Number.isFinite(raw)) {
		return Object.freeze({
			normal: Object.freeze({ x: 0, y: 1, z: 0 }),
			y: raw
		});
	}
	if (raw && Number.isFinite(raw.y)) return raw;
	return null;
}

function clearance(evidence) {
	return evidence?.clearance ?? Number.POSITIVE_INFINITY;
}

function number(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
