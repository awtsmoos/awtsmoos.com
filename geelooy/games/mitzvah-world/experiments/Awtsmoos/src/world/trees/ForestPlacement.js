// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestPlacement.js
 * @description Places deep-core trees through canonical exclusions, crown spacing, and shared succession evidence.
 * The Awtsmoos lets one grove bend around home, road, river, clearing, slope, and remembered forest age;
 * Awtsmoos.com keeps physical truth game-side while life-history returns to the shared core before branches reach the stage.
 */

import {
	ecologyRejectionReason,
	ecologySiteEvidenceAt
} from '../spatial/WorldEcologyClearance.js';
import { ecologySpacingClearance } from '../spatial/WorldEcologySpacing.js';
import { forestCandidateAt, forestRotationY } from './ForestCandidateField.js';
import { forestPlacementHabitat } from './ForestPlacementHabitat.js';
import { forestSuccessionForPlacement } from './ForestSuccessionEvidence.js';

export function createForestPlacements(policies, options = {}) {
	const placements = [];
	const rejections = createRejections();
	const halfSize = options.halfSize || 250;
	const seed = options.seed || 613;
	for (const policy of policies) {
		const habitat = forestPlacementHabitat(policy);
		const accepted = acceptedPlacement(policy, habitat, placements, rejections, options, seed, halfSize);
		if (accepted) placements.push(accepted);
	}
	return Object.freeze({
		placements: Object.freeze(placements),
		rejections: Object.freeze(rejections),
		sources: Object.freeze([
			'canonical-architecture-approaches',
			'canonical-physical-exclusions',
			'canonical-road-corridor',
			'canonical-water-corridor',
			'dynamic-collider-triangles',
			'terrain-normal',
			'crown-aware-spacing',
			'shared-core-forest-succession'
		])
	});
}

function acceptedPlacement(policy, habitat, placements, rejections, options, seed, halfSize) {
	for (let attempt = 0; attempt < 220; attempt += 1) {
		const point = forestCandidateAt(policy.index, attempt, seed, halfSize);
		const evidence = ecologySiteEvidenceAt(point, {
			...habitat,
			groundSampler: options.groundSampler,
			obstacleTriangles: options.obstacleTriangles
		});
		const reason = ecologyRejectionReason(evidence);
		if (reason) {
			rejections[reason] = (rejections[reason] || 0) + 1;
			continue;
		}
		const spacing = ecologySpacingClearance(
			point,
			habitat.siteRadius,
			placements,
			placement => placement.siteRadius
		);
		if (spacing < 0) {
			rejections.spacing += 1;
			continue;
		}
		const succession = forestSuccessionForPlacement(policy, evidence, `${seed}:${attempt}`);
		return Object.freeze({
			...point,
			ecology: evidence,
			policy,
			rotationY: forestRotationY(policy.index, seed),
			sample: evidence.sample,
			siteRadius: habitat.siteRadius * succession.crownScale,
			succession,
			y: evidence.sample.y
		});
	}
	return null;
}

function createRejections() {
	return {
		approach: 0,
		clearing: 0,
		footprint: 0,
		ground: 0,
		obstacle: 0,
		river: 0,
		road: 0,
		slope: 0,
		spacing: 0
	};
}

export default createForestPlacements;
