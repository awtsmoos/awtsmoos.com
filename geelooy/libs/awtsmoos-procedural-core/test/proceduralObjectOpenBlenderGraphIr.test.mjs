// B"H
import test from "node:test";
import assert from "node:assert/strict";
import {
	createOpenBlenderGraphIr,
	createOpenBlenderNodeApiSurface
} from "../src/core/proceduralObject/nodeSystem/native/index.js";
import { createNativeReferenceExecutorRegistry } from "../src/core/proceduralObject/nodeSystem/nativeExecution/index.js";

function definition(surface, nativeType) {
	return surface.blenderPack.definitions.find(
		(candidate) => candidate.metadata.nativeType === nativeType
	);
}

function link(id, fromNode, fromSocket, toNode, toSocket) {
	return {
		id,
		from: { nodeId: fromNode, socketId: fromSocket },
		to: { nodeId: toNode, socketId: toSocket }
	};
}

test("whole Blender material graph IR preserves links and execution evidence", () => {
	const surface = createOpenBlenderNodeApiSurface();
	const executors = createNativeReferenceExecutorRegistry({ surface });
	const noise = definition(surface, "ShaderNodeTexNoise");
	const principled = definition(surface, "ShaderNodeBsdfPrincipled");
	const output = definition(surface, "ShaderNodeOutputMaterial");
	const tree = {
		name: "whole-material-graph",
		kind: "material",
		nodes: [
			{ id: "noise", type: noise.type },
			{ id: "surface", type: principled.type },
			{ id: "output", type: output.type }
		],
		links: [
			link("noise-color", "noise", "color", "surface", "base-color"),
			link("surface-output", "surface", "bsdf", "output", "surface")
		]
	};
	const first = createOpenBlenderGraphIr(tree, { surface, executorRegistry: executors });
	const second = createOpenBlenderGraphIr(tree, { surface, executorRegistry: executors });
	assert.equal(first.ok, true);
	assert.equal(first.contentHash, second.contentHash);
	assert.deepEqual(first.schedule, ["noise", "surface", "output"]);
	assert.equal(first.links.length, 2);
	assert.ok(first.links.every((candidate) => candidate.compatible));
	assert.ok(first.links.every((candidate) => candidate.conversion === "identity"));
	assert.deepEqual(first.executableNodes, ["noise", "surface", "output"]);
});

test("whole Blender geometry graph preserves zones and typed link evidence", () => {
	const surface = createOpenBlenderNodeApiSurface();
	const executors = createNativeReferenceExecutorRegistry({ surface });
	const cube = definition(surface, "GeometryNodeMeshCube");
	const transform = definition(surface, "GeometryNodeTransform");
	const boolean = definition(surface, "GeometryNodeMeshBoolean");
	const ir = createOpenBlenderGraphIr({
		name: "whole-geometry-graph",
		kind: "geometry",
		nodes: [
			{ id: "cube-a", type: cube.type },
			{ id: "transform", type: transform.type },
			{ id: "cube-b", type: cube.type },
			{ id: "boolean", type: boolean.type }
		],
		links: [
			link("a-transform", "cube-a", "mesh", "transform", "geometry"),
			link("transform-boolean", "transform", "geometry", "boolean", "mesh-1"),
			link("b-boolean", "cube-b", "mesh", "boolean", "mesh-2")
		],
		zones: [{ id: "repeat", type: "repeat", bodyNodeIds: ["transform"] }]
	}, { surface, executorRegistry: executors });
	assert.equal(ir.ok, true);
	assert.equal(ir.zones[0].id, "repeat");
	assert.equal(ir.links[2].connectionPolicy, "append-in-stable-link-order");
	assert.ok(ir.executableNodes.includes("cube-a"));
	assert.ok(ir.executableNodes.includes("transform"));
	assert.ok(!ir.executableNodes.includes("boolean"));
});

test("whole graph IR exposes invalid cross-domain links as diagnostics", () => {
	const surface = createOpenBlenderNodeApiSurface();
	const cube = definition(surface, "GeometryNodeMeshCube");
	const output = definition(surface, "ShaderNodeOutputMaterial");
	const ir = createOpenBlenderGraphIr({
		name: "invalid-cross-domain",
		kind: "mixed",
		nodes: [
			{ id: "cube", type: cube.type },
			{ id: "output", type: output.type }
		],
		links: [link("invalid", "cube", "mesh", "output", "surface")]
	}, { surface });
	assert.equal(ir.ok, false);
	assert.deepEqual(ir.invalidLinkIds, ["invalid"]);
	assert.ok(ir.diagnostics.some(
		(diagnostic) => diagnostic.code === "OPEN_NODE_LINK_INCOMPATIBLE"
	));
});
