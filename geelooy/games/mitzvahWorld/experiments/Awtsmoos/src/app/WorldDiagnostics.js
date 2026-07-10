// B"H
import { inspectStairOpening } from './StairOpeningDiagnostics.js';

/** Installs the live proof surface used by mobile and browser verification. */
export function installWorldDiagnostics(runtime) {
	const stairStats = aggregateStairs(
		runtime.terrain.stats.stairStats || [],
		runtime.mainOctree.all([])
	);
	const api = {
		scene: runtime.scene,
		camera: runtime.camera,
		renderer: runtime.renderer,
		state: runtime.state,
		doors: runtime.doors,
		terrainStats: runtime.terrain.stats,
		houseStats: runtime.terrain.stats.houseStats,
		stairStats,
		roadStats: runtime.terrain.roadStats,
		mezuzaStats: runtime.terrain.stats.mezuzaStats,
		cameraStats: runtime.orbit.stats,
		inspectStairOpening: (houseId, level) => inspectStairOpening(runtime, houseId, level)
	};
	window.Awtsmoos = api;
	return api;
}

export function refreshWorldDiagnostics(runtime, api) {
	api.cameraStats = runtime.orbit.stats;
	api.rendererStats = {
		draws: runtime.renderer.stats?.draws,
		triangles: runtime.renderer.stats?.triangles,
		errors: runtime.renderer.stats?.errors || []
	};
	api.state = runtime.state;
}

function aggregateStairs(items, octreeTriangles) {
	const triangleCounts = countTriangleKinds(octreeTriangles);
	const measuredItems = items.map((item) => measureStair(item, triangleCounts));
	return {
		items: measuredItems,
		totalSteps: sum(measuredItems, 'totalSteps'),
		octreeSteps: sum(measuredItems, 'octreeSteps'),
		octreeTriangles: sum(measuredItems, 'octreeTriangles'),
		landings: sum(measuredItems, 'landings'),
		openings: sum(measuredItems, 'openings'),
		maxRise: Math.max(0, ...measuredItems.map((item) => item.maxRise)),
		minTreadDepth: Math.min(Infinity, ...measuredItems.map((item) => item.minTreadDepth)),
		approachClearance: Math.min(Infinity, ...measuredItems.map((item) => item.approachClearance)),
		allStepsInOctree: measuredItems.every((item) => item.allStepsInOctree),
		capsuleFits: measuredItems.every((item) => item.capsuleFits)
	};
}

function measureStair(item, triangleCounts) {
	const octreeTriangles = triangleCounts.get(item.id) || 0;
	const octreeSteps = octreeTriangles / 12;
	const expectedColliderUnits = item.totalSteps + item.landings;
	return {
		...item,
		octreeTriangles,
		octreeSteps,
		expectedColliderUnits,
		allStepsInOctree: octreeSteps === expectedColliderUnits
	};
}

function countTriangleKinds(triangles) {
	const counts = new Map();
	for (const triangle of triangles) {
		counts.set(triangle.kind, (counts.get(triangle.kind) || 0) + 1);
	}
	return counts;
}

function sum(items, key) {
	return items.reduce((total, item) => total + (item[key] || 0), 0);
}
