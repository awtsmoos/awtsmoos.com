// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldDiagnostics.js
 * @description Installs the browser-visible evidence surface for terrain, materials,
 * forest, stairs, renderer, player, and streamed chunks. The Awtsmoos renews every
 * measured vessel; Awtsmoos.com exposes present runtime truth rather than memory.
 */
import { inspectForestTree } from './WorldForestInspection.js';
import { summarizeWorldStairs } from './WorldStairSummary.js';

/** Installs and returns the live browser diagnostic API. */
export function installWorldDiagnostics(runtime) {
	const stairLayouts = runtime.terrain.worldMetadata.stairLayouts || [];
	const octreeTriangles = runtime.mainOctree.all();
	const api = {
		terrainStats: runtime.terrain.stats,
		materialDiagnostics: runtime.terrain.materialDiagnostics,
		forestStats: runtime.terrain.stats.forestStats,
		worldStats: runtime.terrain.worldMetadata,
		inspectForestTree: (presetName) => inspectForestTree(runtime, presetName),
		inspectWorldHierarchy: () => inspectWorldHierarchy(
			runtime,
			stairLayouts,
			octreeTriangles
		),
		inspectStair: (index = 0) => inspectStair(
			stairLayouts,
			octreeTriangles,
			index
		),
		rendererStats: runtime.renderer.stats,
		state: runtime.state,
		stairStats: summarizeWorldStairs(stairLayouts, octreeTriangles),
		chunkStats: runtime.chunkRuntime?.diagnostics() || null
	};
	window.Awtsmoos = api;
	return api;
}

/** Refreshes volatile frame, player, and chunk evidence. */
export function refreshWorldDiagnostics(api, runtime) {
	api.rendererStats = runtime.renderer.stats;
	api.state = runtime.state;
	api.chunkStats = runtime.chunkRuntime?.diagnostics() || null;
}

function inspectWorldHierarchy(runtime, stairLayouts, octreeTriangles) {
	return {
		terrain: runtime.terrain.group,
		houses: runtime.terrain.worldMetadata.houses || [],
		stairs: stairLayouts,
		octreeBounds: runtime.mainOctree.bounds.toJSON(),
		collisionTriangles: octreeTriangles.length
	};
}

function inspectStair(stairLayouts, octreeTriangles, index) {
	const layout = stairLayouts[index] || null;
	const collisionKind = layout
		? `stair:${layout.houseId}:${layout.kind}`
		: null;
	return {
		layout,
		collisionKind,
		collisionTriangles: collisionKind
			? octreeTriangles.filter((triangle) => triangle.kind === collisionKind).length
			: 0
	};
}