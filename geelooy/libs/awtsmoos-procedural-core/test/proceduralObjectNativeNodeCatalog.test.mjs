// B"H
import test from "node:test";
import assert from "node:assert/strict";
import {
	NATIVE_NODE_DEFINITIONS,
	createGeometryGraphIr,
	createMaterialGraphIr,
	createNativeNodeDefinitionRegistry,
	createNativeNodeSchemaPack
} from "../src/core/proceduralObject/nodeSystem/native/index.js";

function link(id, fromNode, fromSocket, toNode, toSocket) {
	return {
		id,
		from: { nodeId: fromNode, socketId: fromSocket },
		to: { nodeId: toNode, socketId: toSocket }
	};
}

test("native node schema exposes broad geometry and material contracts", () => {
	const pack = createNativeNodeSchemaPack();
	const registry = createNativeNodeDefinitionRegistry();
	assert.ok(NATIVE_NODE_DEFINITIONS.length >= 140);
	assert.ok(pack.definitions.length >= 140);
	assert.equal(registry.resolve("geometry.mesh.boolean", "1.0.0").type, "geometry.mesh.boolean");
	assert.equal(registry.resolve("material.shader.principled", "1.0.0").type, "material.shader.principled");
	assert.ok(pack.metadata.geometryDefinitions > 60);
	assert.ok(pack.metadata.materialDefinitions > 50);
});

test("geometry graph IR preserves topology mutations, links, and zones", () => {
	const ir = createGeometryGraphIr({
		name: "native-geometry-test",
		kind: "geometry",
		nodes: [
			{ id: "cube", type: "geometry.mesh.cube" },
			{ id: "transform", type: "geometry.mesh.transform" },
			{ id: "output", type: "geometry.zone.group-output" }
		],
		links: [
			link("cube-transform", "cube", "mesh", "transform", "geometry"),
			link("transform-output", "transform", "geometry", "output", "interface")
		],
		zones: [{ id: "repeat-zone", type: "repeat", bodyNodeIds: ["transform"] }]
	});
	assert.equal(ir.kind, "geometry-graph-ir");
	assert.equal(ir.links.length, 2);
	assert.deepEqual(ir.schedule, ["cube", "transform", "output"]);
	assert.ok(ir.topologyMutationNodes.includes("cube"));
	assert.equal(ir.zones[0].id, "repeat-zone");
});

test("material graph IR preserves closure and output connections", () => {
	const ir = createMaterialGraphIr({
		name: "native-material-test",
		kind: "material",
		nodes: [
			{ id: "noise", type: "material.texture.noise" },
			{ id: "surface", type: "material.shader.principled" },
			{ id: "output", type: "material.output.material" }
		],
		links: [
			link("noise-color", "noise", "color", "surface", "base-color"),
			link("surface-output", "surface", "surface", "output", "surface")
		]
	});
	assert.equal(ir.kind, "material-graph-ir");
	assert.deepEqual(ir.stages.texture, ["noise"]);
	assert.deepEqual(ir.stages.surface, ["surface"]);
	assert.deepEqual(ir.stages.output, ["output"]);
	assert.ok(ir.requiredCapabilities.includes("principled-surface"));
});
