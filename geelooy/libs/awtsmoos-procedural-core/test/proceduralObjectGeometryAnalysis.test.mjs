// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos reveals the hidden edge-river beneath every indexed triangle. */

import assert from "node:assert/strict";
import {
	analyzeTriangleTopology,
	createGeometryArtifact,
	measureGeometryMemory
} from "../src/core/proceduralObject/index.js";

function geometry(id, positions, indices) {
	return createGeometryArtifact({
		id,
		attributes: {
			position: {
				itemSize: 3,
				componentType: "float32",
				array: positions
			}
		},
		indices: { componentType: "uint16", array: indices }
	});
}

const tetrahedron = geometry("tetrahedron", [
	0, 0, 0,
	1, 0, 0,
	0, 1, 0,
	0, 0, 1
], [
	0, 2, 1,
	0, 1, 3,
	1, 2, 3,
	2, 0, 3
]);
const closed = analyzeTriangleTopology(tetrahedron);
assert.equal(closed.faceCount, 4);
assert.equal(closed.edgeCount, 6);
assert.equal(closed.boundaryEdges.length, 0);
assert.equal(closed.nonManifoldEdges.length, 0);
assert.equal(closed.components.length, 1);
assert.equal(closed.watertight, true);

const adversarial = geometry("adversarial", [
	0, 0, 0,
	1, 0, 0,
	0, 1, 0,
	2, 0, 0,
	3, 0, 0,
	2, 1, 0,
	9, 9, 9
], [
	0, 1, 2,
	2, 1, 0,
	3, 4, 5,
	0, 0, 1
]);
const report = analyzeTriangleTopology(adversarial);
assert.deepEqual(report.isolatedVertices, [6]);
assert.deepEqual(report.repeatedIndexFaces, [3]);
assert.deepEqual(report.degenerateFaces, [3]);
assert.deepEqual(report.duplicateFaces, [{ key: "0:1:2", faces: [0, 1] }]);
assert.equal(report.components.length, 2);
assert.equal(report.watertight, false);
assert.equal(Object.isFrozen(report.edges), true);

const nonManifold = geometry("non-manifold", [
	0, 0, 0,
	1, 0, 0,
	0, 1, 0,
	0, -1, 0,
	0, 0, 1
], [0, 1, 2, 1, 0, 3, 0, 1, 4]);
const nonManifoldReport = analyzeTriangleTopology(nonManifold);
assert.equal(nonManifoldReport.nonManifoldEdges.length, 1);
assert.deepEqual(nonManifoldReport.nonManifoldEdges[0].vertices, [0, 1]);
assert.deepEqual(nonManifoldReport.nonManifoldEdges[0].faces, [0, 1, 2]);

const measurement = measureGeometryMemory(tetrahedron);
assert.equal(measurement.measurements.attributeBytes, 48);
assert.equal(measurement.measurements.indexBytes, 24);
assert.equal(measurement.measurements.totalBytes, 72);
assert.equal(measurement.measurements.faceCount, 4);

assert.throws(
	() => analyzeTriangleTopology(createGeometryArtifact({
		topology: "lines",
		attributes: { position: { itemSize: 3, array: [0, 0, 0, 1, 0, 0] } },
		indices: [0, 1]
	})),
	/requires triangle geometry/
);

console.log('B"H | proceduralObjectGeometryAnalysis.test passed');
