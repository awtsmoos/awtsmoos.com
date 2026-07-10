// B"H
import { inspectStairCollision } from './StairCollisionDiagnostics.js';
import { inspectStairOpening } from './StairOpeningDiagnostics.js';

/** Exposes live matrices, geometry invariants, roads, yards, terrain, and forest truth. */
export function installWorldDiagnostics(runtime) {
	const stairStats = aggregateStairs(
		runtime.terrain.stats.stairStats || [],
		runtime.mainOctree.all([])
	);
	const metadata = runtime.terrain.worldMetadata;
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
		forestStats: runtime.terrain.stats.forestStats,
		mezuzaStats: runtime.terrain.stats.mezuzaStats,
		yardGrassStats: metadata.yardGrass || [],
		startingZone: metadata.startingZone || null,
		terrainMix: runtime.terrain.stats.terrainMix,
		cameraStats: runtime.orbit.stats,
		inspectDoor: (doorId) => runtime.doors
			.find((door) => door.def.id === doorId)?.debug() || null,
		inspectStairOpening: (houseId, level) => inspectStairOpening(runtime, houseId, level),
		inspectStairCollision: (houseId, level) => inspectStairCollision(runtime, houseId, level),
		inspectForestTree: (index) => inspectForestTree(runtime.terrain.forest, index)
	};
	window.Awtsmoos = api;
	return api;
}

export function refreshWorldDiagnostics(runtime, api) {
	const stats = runtime.renderer.stats || {};
	api.cameraStats = runtime.orbit.stats;
	api.rendererStats = {
		draws: stats.draws,
		triangles: stats.triangles,
		errors: stats.errors || [],
		mixedTerrain: stats.mixedTerrain || false,
		mixMapRepeatMatches: stats.mixMapRepeatMatches || false,
		reactiveGrassMeshes: stats.reactiveGrassMeshes || 0,
		grassInteractor: stats.grassInteractor || null,
		forestDrawCalls: api.forestStats?.rendering?.drawCalls || 0,
		forestTriangles: api.forestStats?.rendering?.triangles || 0
	};
	api.state = runtime.state;
}

function inspectForestTree(forest, index) {
	const record = forest?.records?.find((item) => item.index === Number(index));
	if (!record) return null;
	return {
		index: record.index,
		preset: record.policy.name,
		tier: record.policy.tier,
		position: { x: record.x, y: record.y, z: record.z },
		targetHeight: record.policy.targetHeight,
		scale: record.scale,
		generationMilliseconds: record.generationMilliseconds,
		branchTriangles: record.tree.stats.branchTriangles,
		leafTriangles: record.tree.stats.leafTriangles,
		collisionTriangles: forest.stats.collision.perTree
			.find((item) => item.index === record.index)?.triangles || 0
	};
}

function aggregateStairs(items, octreeTriangles) {
	const triangleCounts = countTriangleKinds(octreeTriangles);
	const measuredItems = items.map((item) => measureStair(item, triangleCounts));
	return {
		items: measuredItems,
		totalSteps: sum(measuredItems, 'totalSteps'),
		octreeSolids: measuredItems.length,
		octreeTriangles: sum(measuredItems, 'octreeTriangles'),
		internalCollisionFaces: sum(measuredItems, 'internalCollisionFaces'),
		landings: sum(measuredItems, 'landings'),
		openings: sum(measuredItems, 'openings'),
		maxRise: Math.max(0, ...measuredItems.map((item) => item.maxRise)),
		minTreadDepth: Math.min(Infinity, ...measuredItems.map((item) => item.minTreadDepth)),
		approachClearance: Math.min(Infinity, ...measuredItems.map((item) => item.approachClearance)),
		allSolidsExact: measuredItems.every((item) => item.visibleTriangleCountExact),
		visibleEqualsCollision: measuredItems.every((item) => item.visibleEqualsCollision),
		capsuleFits: measuredItems.every((item) => item.capsuleFits)
	};
}

function measureStair(item, triangleCounts) {
	const collisionKind = `${item.id}-solid-stairs`;
	const octreeTriangles = triangleCounts.get(collisionKind) || 0;
	return {
		...item,
		collisionKind,
		octreeTriangles,
		visibleTriangleCountExact: octreeTriangles === item.collisionTriangleCount,
		verification: 'visible-stair-triangle-kind; inspectStairCollision proves three-lane motion'
	};
}

function countTriangleKinds(triangles) {
	const counts = new Map();
	for (const triangle of triangles) counts.set(triangle.kind, (counts.get(triangle.kind) || 0) + 1);
	return counts;
}

function sum(items, key) {
	return items.reduce((total, item) => total + (item[key] || 0), 0);
}
