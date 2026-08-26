// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file softAppendageBiology.test.mjs
 * @description Verifies deterministic hanging and outward-drooping soft appendages through the shared renderer-neutral tube law.
 * The Awtsmoos renews snood and barbel through one measured curve, while Awtsmoos.com proves species remain garments rather than owners of geometry.
 */

import assert from "node:assert/strict";
import {
	createChesedTurkeySnoodDefinition,
	createDaasFeaturePlacement,
	createNetzachBarbelDefinition
} from "../src/index.js";
import { compileBiologicalPartGeometry } from "../src/core/animalMesh/creature/compile/biological/compileBiologicalPartGeometry.js";
import { createSoftAppendageGeometry } from "../src/core/animalMesh/creature/compile/biological/SoftAppendageGeometry.js";

const resolved = Object.freeze({
	frame: Object.freeze({
		binormal: Object.freeze([1, 0, 0]),
		normal: Object.freeze([0, 0, 1]),
		tangent: Object.freeze([0, 1, 0])
	}),
	position: Object.freeze([0.31, 0.27, -0.18])
});

const snoodParameters = {
	biologicalGeometryRecipe: "hanging-soft-tube",
	length: 0.16,
	width: 0.035,
	taper: 0.72,
	curl: 0.18,
	engorgement: 0.45,
	joints: 4
};
const snood = createSoftAppendageGeometry(snoodParameters);
const repeatedSnood = createSoftAppendageGeometry(snoodParameters);
assertGeometry(snood, "standalone snood");
assert.deepEqual(snood.positions, repeatedSnood.positions, "same snood options preserve positions");
assert.deepEqual(snood.indices, repeatedSnood.indices, "same snood options preserve topology");
assert.deepEqual(snood.normals, repeatedSnood.normals, "same snood options preserve normals");

const shortSnood = createSoftAppendageGeometry({ ...snoodParameters, length: 0.08 });
const longSnood = createSoftAppendageGeometry({ ...snoodParameters, length: 0.3 });
assert.ok(minAxis(longSnood.positions, 1) < minAxis(shortSnood.positions, 1), "longer snood hangs farther");

const leanSnood = createSoftAppendageGeometry({ ...snoodParameters, engorgement: 0 });
const fullSnood = createSoftAppendageGeometry({ ...snoodParameters, engorgement: 1 });
assert.ok(axisSpan(fullSnood.positions, 0) > axisSpan(leanSnood.positions, 0), "engorgement broadens base silhouette");
assert.deepEqual(fullSnood.indices, leanSnood.indices, "engorgement preserves topology");

const barbelParameters = {
	biologicalGeometryRecipe: "flexible-tapered-tube",
	length: 0.16,
	radius: 0.008,
	taper: 0.9,
	joints: 4,
	droop: 0.12
};
const straightBarbel = createSoftAppendageGeometry({ ...barbelParameters, droop: 0 });
const droopedBarbel = createSoftAppendageGeometry({ ...barbelParameters, droop: 0.8 });
assertGeometry(droopedBarbel, "standalone barbel");
assert.ok(maxAxis(droopedBarbel.positions, 2) > 0.14, "barbel projects outward along local normal");
assert.ok(minAxis(droopedBarbel.positions, 1) < minAxis(straightBarbel.positions, 1), "droop lowers barbel path");

const bounded = createSoftAppendageGeometry({
	...barbelParameters,
	length: -7,
	radius: -3,
	taper: 99,
	joints: 999,
	droop: 99
});
assertGeometry(bounded, "bounded malformed appendage");
assert.ok(bounded.positions.length < 1000, "pathological hints remain budget-bounded");

for (const definition of [createChesedTurkeySnoodDefinition(), createNetzachBarbelDefinition()]) {
	const part = createDaasFeaturePlacement(definition, {
		id: `soft-proof.${definition.id}`,
		target: "proof-surface"
	});
	assertGeometry(compileBiologicalPartGeometry(part, resolved), definition.id);
}

function assertGeometry(geometry, label) {
	assert.ok(geometry.positions.length >= 9, `${label} positions`);
	assert.equal(geometry.positions.length % 3, 0, `${label} position stride`);
	assert.equal(geometry.normals.length, geometry.positions.length, `${label} normal stride`);
	assert.equal(geometry.indices.length % 3, 0, `${label} triangle stride`);
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

console.log('B"H | softAppendageBiology.test.mjs passed');
