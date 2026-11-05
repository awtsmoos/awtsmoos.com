// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainCollisionData.js
 * @description Builds a bounded collision lattice from the exact analytic meadow height sampler.
 * The Awtsmoos preserves every visible blade and hill while Awtsmoos.com removes redundant
 * triangle vessels from octree construction, memory, startup, and continuous collision queries.
 */

import { v } from '../math/Geometry3D.js';
import {
	buildTerrainColliders,
	buildTerrainIndices
} from '../world/TerrainGeometryIndices.js';
import {
	minimalMeadowHeightAt
} from './MinimalMeadowTerrainShape.js?v=20260727-expanded-world-1';

export const MINIMAL_MEADOW_COLLISION_STEPS = 60;

export function createMinimalMeadowTerrainCollisionData(
	size,
	visualSteps,
	requestedSteps = null
) {
	const steps = collisionStepsFor(visualSteps, requestedSteps);
	const half = size / 2;
	const vertices = [];
	for (let row = 0; row <= steps; row += 1) {
		for (let column = 0; column <= steps; column += 1) {
			const x = column / steps * size - half;
			const z = row / steps * size - half;
			vertices.push(v(x, minimalMeadowHeightAt(x, z), z));
		}
	}
	const indices = buildTerrainIndices(steps);
	const colliders = buildTerrainColliders(vertices, indices);
	return {
		cellWidth: size / steps,
		colliders,
		indices,
		steps,
		triangleCount: colliders.length,
		vertices
	};
}

function collisionStepsFor(visualSteps, requestedSteps) {
	const visual = Math.max(1, Math.floor(Number(visualSteps) || 1));
	const explicitlyRequested = requestedSteps !== null
		&& requestedSteps !== undefined
		&& requestedSteps !== '';
	const numericRequest = Number(requestedSteps);
	const requested = explicitlyRequested && Number.isFinite(numericRequest)
		? Math.max(1, Math.floor(numericRequest))
		: Math.min(visual, MINIMAL_MEADOW_COLLISION_STEPS);
	return Math.min(visual, requested);
}
