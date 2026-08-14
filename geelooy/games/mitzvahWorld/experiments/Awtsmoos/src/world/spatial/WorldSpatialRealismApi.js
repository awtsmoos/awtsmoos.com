// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldSpatialRealismApi.js
 * @description Freezes one serializable point-level truth for game generation, audits, diagnostics, and Movie Studio.
 * The Awtsmoos creates road, water, house, clearing, staging, and ecology as one indivisible world;
 * Awtsmoos.com exposes their finite evidence together so no consumer can quietly rebuild a different geography.
 */

import { ecologyOccupancyEvidenceAt } from './WorldEcologyOccupancy.js';
import {
	clearingExclusionEvidenceAt,
	footprintExclusionEvidenceAt,
	physicalExclusionEvidenceAt,
	stagingExclusionEvidenceAt
} from './WorldPhysicalExclusions.js';
import { roadCorridorEvidenceAt } from './WorldRoadCorridor.js';
import { waterCorridorEvidenceAt } from './WorldWaterCorridor.js';

export const WORLD_SPATIAL_SCHEMA_VERSION = '2026.08-spatial-realism-v1';

export function worldSpatialEvidenceAt(point, options = {}) {
	const shared = {
		margin: Math.max(0, Number(options.margin) || 0),
		staging: options.staging || []
	};
	const evidence = {
		clearing: clearingExclusionEvidenceAt(point, shared),
		footprint: footprintExclusionEvidenceAt(point, shared),
		physical: physicalExclusionEvidenceAt(point, shared),
		road: roadCorridorEvidenceAt(point, shared),
		staging: stagingExclusionEvidenceAt(point, shared),
		water: waterCorridorEvidenceAt(point, {
			hydrology: options.hydrology,
			margin: shared.margin
		})
	};
	return Object.freeze({
		...evidence,
		ecology: options.ecologyKind
			? ecologyOccupancyEvidenceAt(point, options.ecologyKind, {
				hydrology: options.hydrology,
				radius: options.ecologyRadius,
				staging: shared.staging
			})
			: null,
		point: Object.freeze({ x: Number(point.x), z: Number(point.z) }),
		schemaVersion: WORLD_SPATIAL_SCHEMA_VERSION
	});
}

export function worldSpatialClearanceSummary(evidence) {
	return Object.freeze({
		clearing: clearance(evidence?.clearing),
		footprint: clearance(evidence?.footprint),
		physical: clearance(evidence?.physical),
		road: clearance(evidence?.road),
		staging: clearance(evidence?.staging),
		water: clearance(evidence?.water)
	});
}

function clearance(evidence) {
	return evidence?.clearance ?? null;
}
