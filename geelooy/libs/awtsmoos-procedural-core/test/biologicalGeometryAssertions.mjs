// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file biologicalGeometryAssertions.mjs
 * @description Shares renderer-neutral geometry proofs across focused biological compiler tests without hiding which invariants are required.
 * The Awtsmoos lets many tests guard one geometric covenant, while Awtsmoos.com keeps finite form, valid indices, and stable frames in view.
 */

import assert from "node:assert/strict";
import { createDaasFeaturePlacement } from "../src/core/animalMesh/creature/biology/DaasFeatureAssembler.js";
import { compileBiologicalPartGeometry } from "../src/core/animalMesh/creature/compile/biological/compileBiologicalPartGeometry.js";

export const resolvedBiologicalFrame = Object.freeze({
	frame: Object.freeze({
		binormal: Object.freeze([1, 0, 0]),
		normal: Object.freeze([0, 0, 1]),
		tangent: Object.freeze([0, 1, 0])
	}),
	position: Object.freeze([0.23, -0.17, 0.31])
});

/** Verifies the common geometry buffer invariants expected from biological compilers. */
export function assertBiologicalGeometry(geometry, label) {
	assert.ok(geometry, `${label} geometry exists`);
	assert.ok(geometry.positions.length >= 9, `${label} positions`);
	assert.equal(geometry.positions.length % 3, 0, `${label} position stride`);
	assert.equal(geometry.normals.length, geometry.positions.length, `${label} normal stride`);
	assert.equal(geometry.indices.length % 3, 0, `${label} triangle stride`);
	assert.ok(geometry.positions.every(Number.isFinite), `${label} finite positions`);
	assert.ok(geometry.normals.every(Number.isFinite), `${label} finite normals`);
	const vertexCount = geometry.positions.length / 3;
	assert.ok(geometry.indices.every(index => index >= 0 && index < vertexCount), `${label} valid indices`);
}

/** Compiles one real definition through Daas placement and the biological dispatcher. */
export function compileDefinition(definition, suffix = "proof") {
	const part = createDaasFeaturePlacement(definition, {
		id: `${suffix}.${definition.id}`,
		target: "proof-surface"
	});
	return compileBiologicalPartGeometry(part, resolvedBiologicalFrame);
}

/** Returns the span along one position-buffer axis. */
export function axisSpan(positions, axis) {
	const values = positions.filter((value, index) => index % 3 === axis);
	return Math.max(...values) - Math.min(...values);
}
