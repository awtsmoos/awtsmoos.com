// B"H
import assert from 'node:assert/strict';
import { worldToLocal } from '../../world/house/HouseSpec.js';

export function assertStairAndRoadGeometry(fixtures) {
	for (const packageData of fixtures.stairPackages) {
		const { spec, layout, floors } = packageData;
		assert.ok(layout.stepRise <= 0.26 + Number.EPSILON);
		assert.ok(layout.treadDepth >= 0.38 * 1.6);
		assert.ok(layout.lowerLanding.depth >= 0.38 * 3);
		assert.ok(layout.opening.width > 0.76);
		assert.ok(layout.headroom > 1.72);
		assert.equal(layout.steps.length, layout.stepCount);
		for (const floor of floors) {
			const local = worldToLocal(spec, floor.position.x, floor.position.z);
			const containsCenter = Math.abs(layout.opening.centerX - local.x) < floor.size.x / 2 - 0.001
				&& Math.abs(layout.opening.centerZ - local.z) < floor.size.z / 2 - 0.001;
			assert.equal(containsCenter, false, `${floor.id} covers opening center`);
		}
	}
	assert.equal(fixtures.graph.validation.connected, true);
	assert.equal(fixtures.graph.validation.unreachableNodes.length, 0);
	assert.equal(fixtures.graph.validation.houseEntries, fixtures.specs.length);
	const folded = fixtures.routes.flatMap((route) => route.foldedSegments);
	assert.equal(folded.length, 0);
	assert.deepEqual(fixtures.road.visual.vertices, fixtures.road.collider.vertices);
	assert.deepEqual(fixtures.road.visual.faces, fixtures.road.collider.faces);
	assert.equal(fixtures.road.stats.visualSegments, fixtures.road.stats.collisionSegments);
	return {
		staircases: fixtures.stairPackages.length,
		maximumRise: Math.max(...fixtures.stairPackages.map((item) => item.layout.stepRise)),
		minimumTread: Math.min(...fixtures.stairPackages.map((item) => item.layout.treadDepth)),
		roadNodes: fixtures.graph.validation.nodeCount,
		roadEdges: fixtures.graph.validation.edgeCount,
		foldedRoadSegments: folded.length
	};
}
