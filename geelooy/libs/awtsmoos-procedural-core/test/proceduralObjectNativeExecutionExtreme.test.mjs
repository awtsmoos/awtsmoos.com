// B"H
// Boruch Hashem
// Blessed is He
/** Native execution evidence proves fields, topology, transparent glass, and volume IR. */
import assert from "node:assert/strict";
import test from "node:test";
import { createNativeReferenceExecutorRegistry } from "../src/core/proceduralObject/nodeSystem/nativeExecution/createNativeReferenceExecutorRegistry.js";

test("advanced geometry executors set fields, join meshes, and subdivide topology", () => {
	const registry = createNativeReferenceExecutorRegistry();
	const cube = registry.execute("geometry.mesh.cube", { size: [1, 1, 1] }).mesh;
	const moved = registry.execute("geometry.mesh.set-position", {
		geometry: cube,
		selection: ({ index }) => index % 2 === 0,
		offset: [0, 0.25, 0]
	}).geometry;
	assert.notDeepEqual(Array.from(moved.positions), Array.from(cube.positions));
	const joined = registry.execute("geometry.instance.join", { geometry: [cube, moved] }).geometry;
	assert.equal(joined.positions.length, cube.positions.length * 2);
	const subdivided = registry.execute("geometry.mesh.subdivide", { mesh: cube, level: 1 }).mesh;
	assert.equal(subdivided.indices.length, cube.indices.length * 4);
	assert.ok(subdivided.positions.length > cube.positions.length);
});

test("advanced shader executors produce inspectable surface and volume closures", () => {
	const registry = createNativeReferenceExecutorRegistry();
	const transparent = registry.execute("material.shader.transparent", { weight: 0.4 }).surface;
	const glass = registry.execute("material.shader.glass", { ior: 1.52, roughness: 0.1 }).surface;
	const volume = registry.execute("material.shader.volume-principled", { density: 2, anisotropy: 0.3 }).volume;
	const absorption = registry.execute("material.shader.volume-absorption", { density: 0.8 }).volume;
	assert.equal(transparent.type, "transparent");
	assert.equal(glass.properties.ior, 1.52);
	assert.equal(volume.type, "principled-volume");
	assert.equal(absorption.type, "volume-absorption");
});
