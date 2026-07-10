// B"H
import { inspectStairCollision } from './StairCollisionDiagnostics.js';
import { inspectStairOpening } from './StairOpeningDiagnostics.js';

/** Installs live proof surfaces that measure matrices, triangles, and motion. */
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
		inspectDoor: (doorId) => runtime.doors.find((door) => door.def.id === doorId)?.debug() || null,
		inspectStairOpening: (houseId, level) => inspectStairOpening(runtime, houseId, level),
		inspectStairCollision: (houseId, level) => inspectStairCollision(runtime, houseId, level)
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
		octreeRamps: measuredItems.length,
		octreeTriangles: sum(measuredItems, 'octreeTriangles'),
		internalCollisionFaces: sum(measuredItems, 'internalCollisionFaces'),
		landings: sum(measuredItems, 'landings'),
		openings: sum(measuredItems, 'openings'),
		maxRise: Math.max(0, ...measuredItems.map((item) => item.maxRise)),
		minTreadDepth: Math.min(Infinity, ...measuredItems.map((item) => item.minTreadDepth)),
		approachClearance: Math.min(Infinity, ...measuredItems.map((item) => item.approachClearance)),
		allRampsExact: measuredItems.every((item) => item.rampTriangleCountExact),
		allRampsWalkable: measuredItems.every((item) => item.slopeNormalY > 0.72),
		capsuleFits: measuredItems.every((item) => item.capsuleFits)
	};
}

function measureStair(item, triangleCounts) {
	const collisionKind = `${item.id}-collision-ramp`;
	const octreeTriangles = triangleCounts.get(collisionKind) || 0;
	return {
		...item,
		collisionKind,
		octreeTriangles,
		rampTriangleCountExact: octreeTriangles === item.rampTriangleCount,
		verification: 'octree-triangle-kind; call inspectStairCollision for capsule-motion proof'
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
