// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldEcologyOccupancy.js
 * @description Decides whether one point belongs to reed, stone, shrub, or dry botanical life from shared spatial truth.
 * The Awtsmoos gives each created species its boundary without dividing the world; Awtsmoos.com lets ecology choose a policy band
 * while road, water, house, clearing, and staging geometry remain authoritative in one reusable spatial contract.
 */

import { roadCorridorEvidenceAt } from './WorldRoadCorridor.js';
import { waterCorridorEvidenceAt } from './WorldWaterCorridor.js';
import { physicalExclusionEvidenceAt } from './WorldPhysicalExclusions.js';

export function ecologyOccupancyEvidenceAt(point, kind, options = {}) {
	const radius = Math.max(0, Number(options.radius) || 0);
	const policy = ecologyPolicy(kind, radius);
	const road = roadCorridorEvidenceAt(point, { margin: policy.roadMargin });
	const water = waterCorridorEvidenceAt(point, { hydrology: options.hydrology });
	const physical = physicalExclusionEvidenceAt(point, {
		margin: policy.physicalMargin,
		staging: options.staging || []
	});
	const waterBand = waterBandEvidence(water?.edgeClearance, policy.waterMin, policy.waterMax);
	const valid = safeClearance(road) && safeClearance(physical) && waterBand.valid;
	return Object.freeze({
		kind: policy.kind,
		physical,
		policy: Object.freeze({ ...policy }),
		road,
		valid,
		water,
		waterBand
	});
}

export function ecologyPolicy(kind, radius = 0) {
	const normalizedKind = String(kind || 'botanical');
	const policies = {
		botanical: policy(normalizedKind, radius + 0.2, radius, radius + 0.35, Infinity),
		reed: policy(normalizedKind, 0.55 + radius * 0.4, 0.28 + radius * 0.3, -0.45, 2.65),
		shrub: policy(normalizedKind, 0.65 + radius, 0.45 + radius, 2.2 + radius, Infinity),
		'stone-bank': policy(normalizedKind, 0.38 + radius * 0.35, 0.18 + radius * 0.25, -0.7, 2.8),
		'stone-channel': policy(normalizedKind, 0.3 + radius * 0.25, 0.12 + radius * 0.2, -Infinity, -0.08)
	};
	return policies[normalizedKind] || policies.botanical;
}

function policy(kind, roadMargin, physicalMargin, waterMin, waterMax) {
	return Object.freeze({ kind, physicalMargin, roadMargin, waterMax, waterMin });
}

function waterBandEvidence(edgeClearance, minimum, maximum) {
	const value = Number(edgeClearance);
	if (!Number.isFinite(value)) {
		return Object.freeze({ clearance: null, valid: false });
	}
	const lower = Number.isFinite(minimum) ? value - minimum : Infinity;
	const upper = Number.isFinite(maximum) ? maximum - value : Infinity;
	return Object.freeze({
		clearance: Math.min(lower, upper),
		maximum,
		minimum,
		valid: lower >= 0 && upper >= 0,
		value
	});
}

function safeClearance(evidence) {
	return !evidence || evidence.clearance >= 0;
}
