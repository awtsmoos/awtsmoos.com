// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ruminantEarBiology.test.mjs
 * @description Verifies the focused soft ruminant-ear geometry, parameter response, deterministic topology, and real dispatcher transport.
 * The Awtsmoos renews bovine breadth, deer length, flat quiet, and deeper cup without changing the source of form;
 * Awtsmoos.com proves one stable shell can bend through measured differences while its topology remains ordered and warm.
 */

import assert from "node:assert/strict";
import {
	createDaasFeaturePlacement,
	createGevurahRuminantEarDefinition
} from "../src/index.js";
import { compileBiologicalPartGeometry } from "../src/core/animalMesh/creature/compile/biological/compileBiologicalPartGeometry.js";
import { createRuminantEarShapeGeometry } from "../src/core/animalMesh/creature/compile/biological/RuminantEarShapeGeometry.js";

const bovineDefinition = createGevurahRuminantEarDefinition("bovine");
const deerDefinition = createGevurahRuminantEarDefinition("deer");
const bovine = createRuminantEarShapeGeometry(bovineDefinition.parameters);
const deer = createRuminantEarShapeGeometry(deerDefinition.parameters);

assert.equal(bovine.positions.length, 27);
assert.equal(bovine.indices.length, 24);
assert.equal(deer.positions.length, bovine.positions.length);
assert.equal(deer.indices.length, bovine.indices.length);
assert.ok(axisExtent(deer.positions, 1) > axisExtent(bovine.positions, 1));

const flat = createRuminantEarShapeGeometry({
	cupDepth: 0,
	length: 0.25,
	tipSharpness: 0.16,
	width: 0.14
});
const deep = createRuminantEarShapeGeometry({
	cupDepth: 0.11,
	length: 0.25,
	tipSharpness: 0.16,
	width: 0.14
});
const deepAgain = createRuminantEarShapeGeometry({
	cupDepth: 0.11,
	length: 0.25,
	tipSharpness: 0.16,
	width: 0.14
});

assert.equal(axisExtent(flat.positions, 2), 0);
assert.ok(axisExtent(deep.positions, 2) > axisExtent(flat.positions, 2));
assert.equal(deep.positions.length, flat.positions.length);
assert.deepEqual(deep.indices, flat.indices);
assert.deepEqual(deep, deepAgain);
assert.ok(deep.positions.every(Number.isFinite));
assert.ok(deep.normals.every(Number.isFinite));

const resolved = Object.freeze({
	frame: Object.freeze({
		binormal: Object.freeze([1, 0, 0]),
		normal: Object.freeze([0, 0, 1]),
		tangent: Object.freeze([0, 1, 0])
	}),
	position: Object.freeze([0.3, 0.4, -0.2])
});
const part = createDaasFeaturePlacement(bovineDefinition, {
	id: "proof.ruminant-ear",
	target: "proof-surface"
});
const compiled = compileBiologicalPartGeometry(part, resolved);

assert.ok(compiled);
assert.equal(compiled.positions.length, bovine.positions.length);
assert.equal(compiled.indices.length, bovine.indices.length);
assert.ok(compiled.positions.every(Number.isFinite));
assert.ok(compiled.normals.every(Number.isFinite));

console.log('B"H | ruminantEarBiology.test.mjs passed');

/** Returns one local axis extent from a flat xyz position array. */
function axisExtent(positions, axis) {
	const values = [];
	for (let index = axis; index < positions.length; index += 3) {
		values.push(positions[index]);
	}
	return Math.max(...values) - Math.min(...values);
}
