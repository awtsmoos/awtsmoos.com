// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos removes false faces while every surviving data strand remains named. */

import assert from "node:assert/strict";
import {
	assignFaceMaterials,
	compactGeometryVertices,
	createGeometryArtifact,
	repairTriangleGeometry,
	weldGeometryVertices
} from "../src/core/proceduralObject/index.js";

const compactSource = createGeometryArtifact({
	id: "compact-source",
	attributes: {
		position: { itemSize: 3, array: [0, 0, 0, 9, 9, 9, 1, 0, 0, 0, 1, 0] },
		color: { itemSize: 1, array: [10, 99, 20, 30] }
	},
	morphTargets: {
		smile: {
			position: { itemSize: 3, array: [0, 0, 0, 5, 5, 5, 1, 0, 0.1, 0, 1, 0.1] }
		}
	},
	indices: [0, 2, 3],
	bounds: { min: [0, 0, 0], max: [9, 9, 9] }
});
const compacted = compactGeometryVertices(compactSource);
assert.equal(compacted.attributes.position.count, 3);
assert.deepEqual(compacted.attributes.color.array, [10, 20, 30]);
assert.equal(compacted.morphTargets.smile.position.array.length, 9);
assert.deepEqual(compacted.indices.array, [0, 1, 2]);
assert.equal(compacted.bounds, null);
assert.equal(compacted.metadata.compactedVertexCount, 1);

const seamSource = createGeometryArtifact({
	id: "seam-source",
	attributes: {
		position: { itemSize: 3, array: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0] },
		uv: { itemSize: 2, array: [0, 0, 0, 0, 1, 0, 0, 1] }
	},
	morphTargets: {
		shape: {
			position: { itemSize: 3, array: [0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0] }
		}
	},
	indices: [0, 2, 3, 1, 3, 2]
});
const strictWeld = weldGeometryVertices(seamSource, { policy: "strict" });
const positionWeld = weldGeometryVertices(seamSource, { policy: "position-only" });
assert.equal(strictWeld.attributes.position.count, 4);
assert.equal(positionWeld.attributes.position.count, 3);
assert.deepEqual(positionWeld.indices.array, [0, 1, 2, 0, 2, 1]);

const damaged = createGeometryArtifact({
	id: "damaged",
	attributes: {
		position: { itemSize: 3, array: [
			0, 0, 0, 1, 0, 0, 0, 1, 0,
			2, 0, 0, 3, 0, 0, 2, 1, 0,
			9, 9, 9
		] },
		color: { itemSize: 1, array: [1, 2, 3, 4, 5, 6, 7] }
	},
	indices: [0, 1, 2, 2, 1, 0, 3, 4, 5, 0, 0, 1],
	materialSlots: ["stone", "light"]
});
const assigned = assignFaceMaterials(damaged, [0, 1, 0, 1]);
assert.deepEqual(assigned.groups, [
	{ start: 0, count: 3, materialIndex: 0 },
	{ start: 3, count: 3, materialIndex: 1 },
	{ start: 6, count: 3, materialIndex: 0 },
	{ start: 9, count: 3, materialIndex: 1 }
]);
const repaired = repairTriangleGeometry(assigned);
assert.equal(repaired.indices.array.length, 6);
assert.equal(repaired.attributes.position.count, 6);
assert.equal(repaired.attributes.color.count, 6);
assert.equal(repaired.attributes.normal.count, 6);
assert.deepEqual(repaired.groups, [{ start: 0, count: 6, materialIndex: 0 }]);
assert.equal(repaired.metadata.removedFaceCount, 2);
assert.equal(repaired.metadata.repairSourceFaceCount, 4);
assert.equal(Object.isFrozen(repaired), true);

assert.throws(
	() => assignFaceMaterials(damaged, [0]),
	/match triangle count/
);
assert.throws(
	() => weldGeometryVertices(seamSource, { tolerance: -1 }),
	/finite and non-negative/
);

console.log('B"H | proceduralObjectGeometryRepair.test passed');
