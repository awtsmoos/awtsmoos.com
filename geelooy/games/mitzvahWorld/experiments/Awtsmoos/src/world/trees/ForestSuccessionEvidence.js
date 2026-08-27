// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestSuccessionEvidence.js
 * @description Converts canonical village site evidence into shared-core forest succession channels.
 * The Awtsmoos lets road edge, clearing, slope, and habitat history mark each tree without changing its species soul;
 * Awtsmoos.com turns accepted placement evidence into age and vigor so the grove reads as a living whole.
 */

import { createForestSuccessionProfile } from '../../../../../../../libs/awtsmoos-procedural-core/src/core/geometry/generators/tree/forestSuccession.js';

export function forestSuccessionForPlacement(policy, evidence, seed) {
	const habitatScore = habitatScoreFor(evidence);
	const disturbance = disturbanceFor(evidence);
	const edgeExposure = edgeExposureFor(evidence);
	return createForestSuccessionProfile({
		competition: competitionFor(policy),
		disturbance,
		edgeExposure,
		habitatScore,
		seed: `${seed}:${policy.index}:${policy.name}`
	});
}

function habitatScoreFor(evidence) {
	const normalY = Number(evidence?.sample?.normal?.y ?? 1);
	const clearance = Math.max(0, Number(evidence?.minimumClearance ?? evidence?.clearance ?? 4));
	return unit(normalY * 0.62 + Math.min(1, clearance / 12) * 0.38);
}

function disturbanceFor(evidence) {
	const road = Number(evidence?.road?.clearance ?? 16);
	const clearing = Number(evidence?.clearing?.clearance ?? 16);
	return unit(Math.max(0, 1 - Math.min(road, clearing) / 14));
}

function edgeExposureFor(evidence) {
	const slope = 1 - Number(evidence?.sample?.normal?.y ?? 1);
	const waterGap = Math.max(0, Number(evidence?.water?.edgeClearance ?? 12));
	return unit(slope * 1.4 + Math.max(0, 1 - waterGap / 10) * 0.25);
}

function competitionFor(policy) {
	return unit((Number(policy.spacing) || 8) < 9 ? 0.58 : 0.34);
}

function unit(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
