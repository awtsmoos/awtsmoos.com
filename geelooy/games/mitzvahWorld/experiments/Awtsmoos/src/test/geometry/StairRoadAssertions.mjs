// B"H
import assert from 'node:assert/strict';
import { worldToLocal } from '../../world/house/HouseSpec.js';

export function assertStairAndRoadGeometry(fixtures) {
	for (const packageData of fixtures.stairPackages) {
		assertStairPackage(packageData);
	}
	assert.equal(fixtures.graph.validation.connected, true);
	assert.equal(fixtures.graph.validation.unreachableNodes.length, 0);
	assert.equal(fixtures.graph.validation.houseEntries, fixtures.specs.length);
	const folded = fixtures.routes.flatMap((route) => route.foldedSegments);
	const pathFailures = fixtures.routes.filter((route) => route.pathfinding.failed);
	assert.equal(folded.length, 0, 'house approach folded backward');
	assert.equal(pathFailures.length, 0, 'A* failed to find a route');
	assert.equal(fixtures.centerlineIntersections.length, 0, 'road centerline violates expanded obstacles');
	assert.equal(fixtures.roadClearance.finalStripIntersections.length, 0, 'rendered road strip hits static geometry');
	assert.deepEqual(fixtures.road.visual.vertices, fixtures.road.collider.vertices);
	assert.deepEqual(fixtures.road.visual.faces, fixtures.road.collider.faces);
	assert.equal(fixtures.road.stats.visualSegments, fixtures.road.stats.collisionSegments);
	return {
		staircases: fixtures.stairPackages.length,
		maximumRise: Math.max(...fixtures.stairPackages.map((item) => item.layout.stepRise)),
		minimumTread: Math.min(...fixtures.stairPackages.map((item) => item.layout.treadDepth)),
		rampTriangles: fixtures.stairPackages.reduce((sum, item) => sum + item.traversal.rampTriangleCount, 0),
		stairPenetrations: fixtures.stairPackages.reduce((sum, item) => sum + item.traversal.penetrations.length, 0),
		roadNodes: fixtures.graph.validation.nodeCount,
		roadEdges: fixtures.graph.validation.edgeCount,
		foldedRoadSegments: folded.length,
		roadCenterlineIntersections: fixtures.centerlineIntersections.length,
		finalRoadStripIntersections: fixtures.roadClearance.finalStripIntersections.length
	};
}

function assertStairPackage(packageData) {
	const { spec, layout, floors, visual, ramp, traversal } = packageData;
	assert.ok(layout.stepRise <= 0.26 + Number.EPSILON);
	assert.ok(layout.treadDepth >= 0.38 * 1.6);
	assert.ok(layout.lowerLanding.depth >= 0.38 * 3);
	assert.ok(layout.opening.width > 0.76);
	assert.ok(layout.headroom > 1.72);
	assert.equal(layout.steps.length, layout.stepCount);
	assert.equal(visual.solid, false, 'visual steps must not enter collision');
	assert.equal(ramp.solid, true);
	assert.equal(ramp.faces.length, 1, 'ramp must have one quad only');
	assert.equal(visual.uvs.length, visual.vertices.length * 2, 'every visual stair vertex needs an authored UV');
	assert.equal(visual.userData.AwtsmoosStairVisual.degenerateUvFaces, 0);
	assert.equal(traversal.rampTriangleCount, 2);
	assert.equal(traversal.internalCollisionFaces, 0);
	assert.equal(traversal.monotonicAscent, true);
	assert.equal(traversal.reachesUpperFloor, true);
	assert.equal(traversal.reachesLowerFloor, true);
	assert.equal(traversal.ascendingWallContacts.length, 0);
	assert.equal(traversal.descendingWallContacts.length, 0);
	assert.equal(traversal.penetrations.length, 0);
	for (const floor of floors) {
		const local = worldToLocal(spec, floor.position.x, floor.position.z);
		const containsCenter = Math.abs(layout.opening.centerX - local.x) < floor.size.x / 2 - 0.001
			&& Math.abs(layout.opening.centerZ - local.z) < floor.size.z / 2 - 0.001;
		assert.equal(containsCenter, false, `${floor.id} covers opening center`);
	}
}
