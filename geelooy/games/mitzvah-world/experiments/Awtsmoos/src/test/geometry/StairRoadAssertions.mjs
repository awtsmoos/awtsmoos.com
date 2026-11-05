// B"H
import assert from 'node:assert/strict';
import { worldToLocal } from '../../world/house/HouseSpec.js';

export function assertStairAndRoadGeometry(fixtures) {
	for (const packageData of fixtures.stairPackages) assertStairPackage(packageData);
	assert.equal(fixtures.graph.validation.connected, true);
	assert.equal(fixtures.graph.validation.unreachableNodes.length, 0);
	assert.equal(fixtures.graph.validation.houseEntries, fixtures.specs.length);
	const folded = fixtures.routes.flatMap((route) => route.foldedSegments);
	const pathFailures = fixtures.routes.filter((route) => route.pathfinding.failed);
	const terminalGaps = fixtures.routes.flatMap((route) => [
		route.terminalDistances.from,
		route.terminalDistances.to
	]).filter((distance) => distance > 0.01);
	assert.equal(folded.length, 0, 'house approach folded backward');
	assert.equal(pathFailures.length, 0, 'A* failed to find a route');
	assert.equal(terminalGaps.length, 0, 'a road terminates before its node');
	assert.equal(fixtures.centerlineIntersections.length, 0, 'road centerline violates expanded obstacles');
	assert.equal(fixtures.roadClearance.finalStripIntersections.length, 0, 'rendered road surface hits static geometry');
	assert.equal(fixtures.road.visual, fixtures.road.collider, 'visible road must be its own collider');
	assert.equal(fixtures.road.stats.visibleEqualsCollision, true);
	assert.ok(fixtures.road.stats.junctionCount >= fixtures.specs.length);
	for (const route of fixtures.routes) {
		assert.ok(route.pathfinding.maximumSampleGap <= 1.16, `${route.id} contains a visual gap`);
	}
	return {
		staircases: fixtures.stairPackages.length,
		maximumRise: Math.max(...fixtures.stairPackages.map((item) => item.layout.stepRise)),
		minimumTread: Math.min(...fixtures.stairPackages.map((item) => item.layout.treadDepth)),
		visibleStairTriangles: fixtures.stairPackages.reduce((sum, item) => sum + item.traversal.triangleCount, 0),
		stairPenetrations: fixtures.stairPackages.reduce((sum, item) => sum + item.traversal.penetrations.length, 0),
		roadNodes: fixtures.graph.validation.nodeCount,
		roadEdges: fixtures.graph.validation.edgeCount,
		roadJunctions: fixtures.road.stats.junctionCount,
		roadTerminalGaps: terminalGaps.length,
		roadCenterlineIntersections: fixtures.centerlineIntersections.length,
		finalRoadStripIntersections: fixtures.roadClearance.finalStripIntersections.length
	};
}

function assertStairPackage(packageData) {
	const { spec, layout, floors, solid, traversal } = packageData;
	assert.ok(layout.stepRise <= 0.24 + Number.EPSILON);
	assert.ok(layout.treadDepth >= 0.38 * 1.7);
	assert.ok(layout.lowerLanding.depth >= 0.38 * 3.5);
	assert.ok(layout.opening.width > 0.76);
	assert.ok(layout.headroom > 1.72);
	assert.equal(layout.steps.length, layout.stepCount);
	assert.equal(solid.solid, true);
	assert.equal(solid.walkable, true);
	assert.equal(solid.visible, undefined);
	assert.equal(solid.uvs.length, solid.vertices.length * 2);
	assert.equal(solid.userData.AwtsmoosStairSolid.visibleEqualsCollision, true);
	assert.equal(traversal.visibleMeshId, traversal.collisionMeshId);
	assert.equal(traversal.internalCollisionFaces, 0);
	assert.equal(traversal.runs.length, 3);
	assert.equal(traversal.monotonicAscent, true);
	assert.equal(traversal.reachesUpperFloor, true);
	assert.equal(traversal.reachesLowerFloor, true);
	assert.equal(traversal.wallContacts.length, 0);
	assert.equal(traversal.penetrations.length, 0);
	assert.equal(traversal.stableMidTreads, true);
	for (const floor of floors) {
		const local = worldToLocal(spec, floor.position.x, floor.position.z);
		const containsCenter = Math.abs(layout.opening.centerX - local.x) < floor.size.x / 2 - 0.001
			&& Math.abs(layout.opening.centerZ - local.z) < floor.size.z / 2 - 0.001;
		assert.equal(containsCenter, false, `${floor.id} covers opening center`);
	}
}
