// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file dewlapBiology.test.mjs
 * @description Verifies the deterministic folded dewlap volume, parameter response, stable topology, real thickness, and dispatcher transport.
 * The Awtsmoos renews length, breadth, fold, softness, and paired skin without disturbing the hidden covenant of vertices;
 * Awtsmoos.com proves one hanging form may change its measured garment while topology remains ordered through every turn and difference.
 */

import assert from "node:assert/strict";
import {
	createDaasFeaturePlacement,
	createGevurahDewlapDefinition
} from "../src/index.js";
import { compileBiologicalPartGeometry } from "../src/core/animalMesh/creature/compile/biological/compileBiologicalPartGeometry.js";
import { createDewlapShapeGeometry } from "../src/core/animalMesh/creature/compile/biological/DewlapShapeGeometry.js";

const defaultDefinition = createGevurahDewlapDefinition();
const defaultGeometry = createDewlapShapeGeometry(defaultDefinition.parameters);
assert.equal(defaultGeometry.positions.length, 270);
assert.equal(defaultGeometry.indices.length, 528);
assert.equal(defaultGeometry.normals.length, defaultGeometry.positions.length);
assert.ok(defaultGeometry.positions.every(Number.isFinite));
assert.ok(defaultGeometry.normals.every(Number.isFinite));
assertValidIndices(defaultGeometry);

const longGeometry = createDewlapShapeGeometry({
	...defaultDefinition.parameters,
	length: 0.62
});
const deepGeometry = createDewlapShapeGeometry({
	...defaultDefinition.parameters,
	depth: 0.28
});
assert.ok(axisExtent(longGeometry.positions, 1) > axisExtent(defaultGeometry.positions, 1));
assert.ok(axisExtent(deepGeometry.positions, 0) > axisExtent(defaultGeometry.positions, 0));
assert.deepEqual(longGeometry.indices, defaultGeometry.indices);
assert.deepEqual(deepGeometry.indices, defaultGeometry.indices);

const thinGeometry = createDewlapShapeGeometry({
	...defaultDefinition.parameters,
	thickness: 0
});
const thickGeometry = createDewlapShapeGeometry({
	...defaultDefinition.parameters,
	thickness: 0.06
});
assert.equal(layerSeparation(thinGeometry.positions), 0);
assert.ok(layerSeparation(thickGeometry.positions) > 0.05);
assert.deepEqual(thinGeometry.indices, thickGeometry.indices);

const oneFold = createDewlapShapeGeometry({
	...defaultDefinition.parameters,
	folds: 1,
	softness: 0.1
});
const fourFolds = createDewlapShapeGeometry({
	...defaultDefinition.parameters,
	folds: 4,
	softness: 1
});
assert.notDeepEqual(oneFold.positions, fourFolds.positions);
assert.equal(oneFold.positions.length, fourFolds.positions.length);
assert.deepEqual(oneFold.indices, fourFolds.indices);
assert.deepEqual(fourFolds, createDewlapShapeGeometry({
	...defaultDefinition.parameters,
	folds: 4,
	softness: 1
}));

const resolved = Object.freeze({
	frame: Object.freeze({
		binormal: Object.freeze([1, 0, 0]),
		normal: Object.freeze([0, 0, 1]),
		tangent: Object.freeze([0, 1, 0])
	}),
	position: Object.freeze([0.31, 0.42, -0.17])
});
const part = createDaasFeaturePlacement(defaultDefinition, {
	id: "proof.dewlap",
	target: "proof-surface"
});
const compiled = compileBiologicalPartGeometry(part, resolved);
assert.ok(compiled);
assert.equal(compiled.positions.length, defaultGeometry.positions.length);
assert.equal(compiled.indices.length, defaultGeometry.indices.length);
assert.ok(compiled.positions.every(Number.isFinite));
assert.ok(compiled.normals.every(Number.isFinite));
assertValidIndices(compiled);

console.log('B"H | dewlapBiology.test.mjs passed');

/** Returns one axis extent from a flat xyz position array. */
function axisExtent(positions, axis) {
	const values = [];
	for (let index = axis; index < positions.length; index += 3) {
		values.push(positions[index]);
	}
	return Math.max(...values) - Math.min(...values);
}

/** Measures front/back separation at the first stable grid vertex. */
function layerSeparation(positions) {
	return Math.abs(positions[2] - positions[137]);
}

/** Asserts all triangle indices stay inside the geometry vertex range. */
function assertValidIndices(geometry) {
	const vertexCount = geometry.positions.length / 3;
	assert.ok(geometry.indices.every(index => index >= 0 && index < vertexCount));
}
