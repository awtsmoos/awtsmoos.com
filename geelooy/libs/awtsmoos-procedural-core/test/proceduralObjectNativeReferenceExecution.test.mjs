// B"H
import test from "node:test";
import assert from "node:assert/strict";
import { createOpenBlenderNodeApiSurface } from "../src/core/proceduralObject/nodeSystem/native/index.js";
import { createNativeReferenceExecutorRegistry } from "../src/core/proceduralObject/nodeSystem/nativeExecution/index.js";

function definitionByNativeType(surface, nativeType) {
	return surface.blenderPack.definitions.find(
		(definition) => definition.metadata.nativeType === nativeType
	);
}

test("native reference math and vector execution is deterministic", () => {
	const registry = createNativeReferenceExecutorRegistry();
	assert.equal(
		registry.execute("function.math", { a: 6, b: 7 }, { operation: "multiply" }).value,
		42
	);
	assert.deepEqual(
		registry.execute(
			"function.vector-math",
			{ a: [1, 0, 0], b: [0, 1, 0] },
			{ operation: "cross" }
		).vector,
		[0, 0, 1]
	);
});

test("native procedural noise is stable and bounded", () => {
	const registry = createNativeReferenceExecutorRegistry();
	const input = { vector: [0.17, 0.33, 0.61], scale: 4.2, detail: 4, roughness: 0.55 };
	const first = registry.execute("material.texture.noise", input, { seed: 613 });
	const second = registry.execute("material.texture.noise", input, { seed: 613 });
	assert.deepEqual(first, second);
	assert.ok(first.factor >= 0);
	assert.ok(first.factor <= 1);
	assert.deepEqual(first.color, [first.factor, first.factor, first.factor, 1]);
});

test("native shader execution produces inspectable material closure artifacts", () => {
	const registry = createNativeReferenceExecutorRegistry();
	const surface = registry.execute("material.shader.principled", {
		"base-color": [0.12, 0.42, 0.8, 1],
		roughness: 0.24,
		metallic: 0.18
	}).surface;
	const material = registry.execute("material.output.material", { surface }).material;
	assert.equal(surface.schema, "awtsmoos.shader-closure");
	assert.equal(surface.type, "principled");
	assert.equal(surface.parameters.roughness, 0.24);
	assert.equal(material.schema, "awtsmoos.material-artifact");
	assert.equal(material.surface, surface);
});

test("native geometry execution creates and transforms typed mesh arrays", () => {
	const registry = createNativeReferenceExecutorRegistry();
	const cube = registry.execute("geometry.mesh.cube", { size: [2, 4, 6] }).mesh;
	const transformed = registry.execute("geometry.mesh.transform", {
		geometry: cube,
		translation: [1, 2, 3],
		scale: [2, 1, 0.5]
	}).geometry;
	assert.ok(cube.positions instanceof Float32Array);
	assert.ok(cube.indices instanceof Uint32Array);
	assert.equal(cube.positions.length, 24);
	assert.equal(cube.indices.length, 36);
	assert.equal(transformed.positions[0], -1);
	assert.equal(transformed.positions[1], 0);
	assert.equal(transformed.positions[2], 1.5);
	assert.equal(transformed.metadata.transformed, true);
});

test("Blender aliases execute and increase honest parity coverage", () => {
	const surface = createOpenBlenderNodeApiSurface();
	const registry = createNativeReferenceExecutorRegistry({ surface });
	const math = definitionByNativeType(surface, "ShaderNodeMath");
	const cube = definitionByNativeType(surface, "GeometryNodeMeshCube");
	assert.equal(registry.execute(math.type, { a: 10, b: 3 }, { operation: "subtract" }).value, 7);
	assert.equal(registry.execute(cube.type, { size: [1, 1, 1] }).mesh.indices.length, 36);
	const parity = surface.createParityMatrix({ executorRegistry: registry });
	assert.ok(parity.counts.executable >= 10);
	assert.ok(parity.counts.executable < parity.counts.total);
	assert.ok(parity.missingExecution.length > 0);
});
