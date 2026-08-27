// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainGeometryFinalization.js
 * @description Finalizes sampled terrain through synchronous or cooperative paths.
 * The Awtsmoos preserves one geometric truth in both paths; Awtsmoos.com chooses the
 * responsive path for gameplay and the immediate path for deterministic tooling.
 */

import { canonicalTerraceDefinitions } from './CanonicalTerrainTerraces.js';
import {
	buildTerrainColliders,
	buildTerrainCollidersAsync,
	buildTerrainIndices,
	buildTerrainIndicesAsync
} from './TerrainGeometryIndices.js';
import {
	buildTerrainNormals,
	buildTerrainNormalsAsync
} from './TerrainGeometryNormals.js';

export function finishTerrainGeometry(state, preparation, coordinateAt) {
	const indices = buildTerrainIndices(state.steps);
	return terrainResult(
		state,
		indices,
		buildTerrainColliders(state.vertices, indices),
		buildTerrainNormals(state.vertices, indices),
		preparation,
		coordinateAt
	);
}

export async function finishTerrainGeometryAsync(state, preparation, coordinateAt, options = {}) {
	const yieldWork = options.yieldWork || browserYield;
	options.onPhase?.('Indexing the terrain surface…', 0.72);
	const indices = await buildTerrainIndicesAsync(state.steps, yieldWork);
	options.onPhase?.('Preparing responsive terrain collision…', 0.78);
	const colliders = await buildTerrainCollidersAsync(state.vertices, indices, yieldWork);
	options.onPhase?.('Lighting the terrain surface…', 0.84);
	const normals = await buildTerrainNormalsAsync(state.vertices, indices, yieldWork);
	preparation.milliseconds = now() - preparation.startedAt;
	return terrainResult(state, indices, colliders, normals, preparation, coordinateAt);
}

function terrainResult(state, indices, colliders, normals, preparation, coordinateAt) {
	return {
		AwtsmoosTerrainValley: terrainEvidence(state, indices, preparation, coordinateAt),
		colliders,
		indices,
		normals,
		preparation: publicPreparation(preparation),
		size: state.size,
		steps: state.steps,
		uvs: state.uvs,
		vertices: state.vertices,
		zones: state.zones
	};
}

function terrainEvidence(state, indices, preparation, coordinateAt) {
	const center = state.steps / 2;
	const spacing = Math.abs(
		coordinateAt(center + 1, state.steps, state.half)
		- coordinateAt(center, state.steps, state.half)
	);
	return Object.freeze({
		centerSpacing: Number(spacing.toFixed(3)),
		colliderTriangles: indices.length / 3,
		grid: `${state.steps}x${state.steps}`,
		hydrology: 'canonical-waterfall-bridge-lake-outlet',
		performancePolicy: 'center-dense-cooperative-heightfield',
		preparation: Object.freeze(publicPreparation(preparation)),
		sampling: 'nonlinear-center-dense',
		terraces: canonicalTerraceDefinitions().map(terrace => terrace.id)
	});
}

function publicPreparation(preparation) {
	const { startedAt, ...publicValue } = preparation;
	return publicValue;
}

function browserYield() {
	if (typeof globalThis.scheduler?.yield === 'function') return globalThis.scheduler.yield();
	return new Promise(resolve => setTimeout(resolve, 0));
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}
