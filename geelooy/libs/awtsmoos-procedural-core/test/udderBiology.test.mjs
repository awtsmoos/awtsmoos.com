// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file udderBiology.test.mjs
 * @description Verifies deterministic standalone udder geometry, bounded morphology, and canonical biological-frame compilation.
 * The Awtsmoos renews soft form from stable law, while Awtsmoos.com proves the vessel may stand alone or travel through an attachment frame.
 */

import assert from "node:assert/strict";
import {
	createDaasFeaturePlacement,
	createGevurahUdderDefinition
} from "../src/index.js";
import { compileBiologicalPartGeometry } from "../src/core/animalMesh/creature/compile/biological/compileBiologicalPartGeometry.js";
import { createUdderShapeGeometry } from "../src/core/animalMesh/creature/compile/biological/UdderShapeGeometry.js";

const resolved = Object.freeze({
	frame: Object.freeze({
		binormal: Object.freeze([1, 0, 0]),
		normal: Object.freeze([0, 0, 1]),
		tangent: Object.freeze([0, 1, 0])
	}),
	position: Object.freeze([0.4, -0.2, 0.7])
});

const parameters = {
	width: 0.32,
	length: 0.34,
	depth: 0.2,
	fullness: 0.55,
	teatCount: 4,
	teatLength: 0.09
};
const first = createUdderShapeGeometry(parameters);
const repeated = createUdderShapeGeometry(parameters);
assertGeometry(first, "standalone udder");
assert.deepEqual(first.positions, repeated.positions, "same options preserve positions");
assert.deepEqual(first.indices, repeated.indices, "same options preserve topology");
assert.deepEqual(first.normals, repeated.normals, "same options preserve normals");

const noTeats = createUdderShapeGeometry({ ...parameters, teatCount: 0 });
const eightTeats = createUdderShapeGeometry({ ...parameters, teatCount: 8 });
const clampedTeats = createUdderShapeGeometry({ ...parameters, teatCount: 99 });
assertGeometry(noTeats, "zero-teat udder");
assert.ok(first.positions.length > noTeats.positions.length, "teats add bounded geometry");
assert.equal(clampedTeats.positions.length, eightTeats.positions.length, "teat count clamps at eight");

const shortTeats = createUdderShapeGeometry({ ...parameters, teatLength: 0.04 });
const longTeats = createUdderShapeGeometry({ ...parameters, teatLength: 0.16 });
assert.ok(maxAxis(longTeats.positions, 2) > maxAxis(shortTeats.positions, 2), "teat length changes local reach");

const narrow = createUdderShapeGeometry({ ...parameters, width: 0.22 });
const wide = createUdderShapeGeometry({ ...parameters, width: 0.52 });
assert.ok(axisSpan(wide.positions, 0) > axisSpan(narrow.positions, 0), "width changes silhouette");

const definition = createGevurahUdderDefinition();
const part = createDaasFeaturePlacement(definition, {
	id: "proof.udder",
	target: "proof-surface"
});
const compiled = compileBiologicalPartGeometry(part, resolved);
assertGeometry(compiled, "compiled udder");
assert.ok(minAxis(compiled.positions, 0) > minAxis(first.positions, 0), "resolved position transports geometry");

function assertGeometry(geometry, label) {
	assert.ok(geometry.positions.length >= 9, `${label} positions`);
	assert.equal(geometry.positions.length % 3, 0, `${label} position stride`);
	assert.equal(geometry.normals.length, geometry.positions.length, `${label} normal stride`);
	assert.equal(geometry.indices.length % 3, 0, `${label} triangle indices`);
	assert.ok(geometry.positions.every(Number.isFinite), `${label} finite positions`);
	assert.ok(geometry.normals.every(Number.isFinite), `${label} finite normals`);
	const vertexCount = geometry.positions.length / 3;
	assert.ok(geometry.indices.every(index => index >= 0 && index < vertexCount), `${label} valid indices`);
}

function axisValues(positions, axis) {
	return positions.filter((value, index) => index % 3 === axis);
}

function minAxis(positions, axis) {
	return Math.min(...axisValues(positions, axis));
}

function maxAxis(positions, axis) {
	return Math.max(...axisValues(positions, axis));
}

function axisSpan(positions, axis) {
	return maxAxis(positions, axis) - minAxis(positions, axis);
}

console.log('B"H | udderBiology.test.mjs passed');
