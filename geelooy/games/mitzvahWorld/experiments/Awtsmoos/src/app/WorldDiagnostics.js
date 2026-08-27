// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldDiagnostics.js
 * @description Publishes live terrain, renderer, streaming, player, and performance evidence.
 * The Awtsmoos renews every measured vessel; Awtsmoos.com exposes present runtime truth
 * so mountains, stairs, frames, and hidden costs remain inspectable rather than remembered.
 */

import { inspectForestTree } from './WorldForestInspection.js';
import { summarizeWorldStairs } from './WorldStairSummary.js';

export function installWorldDiagnostics(runtime) {
	const stairLayouts = runtime.terrain.worldMetadata.stairLayouts || [];
	const octreeTriangles = runtime.mainOctree.all();
	const api = {
		chunkStats: runtime.chunkRuntime?.diagnostics() || null,
		forestStats: runtime.terrain.stats.forestStats,
		inspectForestTree: (presetName) => inspectForestTree(runtime, presetName),
		inspectStair: (index = 0) => inspectStair(
			stairLayouts,
			octreeTriangles,
			index
		),
		inspectWorldHierarchy: () => inspectWorldHierarchy(
			runtime,
			stairLayouts,
			octreeTriangles
		),
		materialDiagnostics: runtime.terrain.materialDiagnostics,
		performance: runtime.performanceMonitor?.diagnostics() || null,
		rendererStats: runtime.renderer.stats,
		stairStats: summarizeWorldStairs(stairLayouts, octreeTriangles),
		state: runtime.state,
		terrainStats: runtime.terrain.stats,
		worldStats: runtime.terrain.worldMetadata
	};
	window.Awtsmoos = api;
	return api;
}

export function refreshWorldDiagnostics(api, runtime) {
	api.chunkStats = runtime.chunkRuntime?.diagnostics() || null;
	api.performance = runtime.performanceMonitor?.diagnostics() || null;
	api.rendererStats = runtime.renderer.stats;
	api.state = runtime.state;
}

function inspectWorldHierarchy(runtime, stairLayouts, octreeTriangles) {
	return {
		collisionTriangles: octreeTriangles.length,
		houses: runtime.terrain.worldMetadata.houses || [],
		octreeBounds: runtime.mainOctree.bounds.toJSON(),
		stairs: stairLayouts,
		terrain: runtime.terrain.group
	};
}

function inspectStair(stairLayouts, octreeTriangles, index) {
	const layout = stairLayouts[index] || null;
	const collisionKind = layout
		? `stair:${layout.houseId}:${layout.kind}`
		: null;
	return {
		collisionKind,
		collisionTriangles: collisionKind
			? octreeTriangles.filter((triangle) => triangle.kind === collisionKind).length
			: 0,
		layout
	};
}
