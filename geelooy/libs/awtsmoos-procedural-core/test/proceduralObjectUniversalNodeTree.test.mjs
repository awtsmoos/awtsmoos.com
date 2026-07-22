// B"H
// Boruch Hashem
// Blessed is He
/** Universal tree evidence preserves arbitrary nodes, ordered links, interfaces, and zones. */
import assert from "node:assert/strict";
import { createUniversalNodeTree } from "../src/core/proceduralObject/nodeSystem/createUniversalNodeTree.js";
import { compileUniversalNodeTreePlan } from "../src/core/proceduralObject/nodeSystem/compileUniversalNodeTreePlan.js";
import { createNodeParityReport } from "../src/core/proceduralObject/nodeSystem/createNodeParityReport.js";
import { validateUniversalNodeTree } from "../src/core/proceduralObject/nodeSystem/validateUniversalNodeTree.js";

const input = {
	name: "extreme.material.tree",
	kind: "material",
	nodes: [
		{ id: "texture.a", type: "blender.shader.noise", properties: { dimensions: "4D" }, metadata: { family: "texture", nativeSemantics: true } },
		{ id: "texture.b", type: "future.shader.texture", properties: { opaque: true }, metadata: { family: "texture" } },
		{ id: "surface.mix", type: "blender.shader.mix", parentId: "frame.surface", metadata: { family: "shader" } }
	],
	links: [
		{ id: "link.b", index: 1, from: { nodeId: "texture.b", socketId: "color" }, to: { nodeId: "surface.mix", socketId: "shader" } },
		{ id: "link.a", index: 0, from: { nodeId: "texture.a", socketId: "factor" }, to: { nodeId: "surface.mix", socketId: "shader" } }
	],
	interfaceItems: [
		{ id: "panel.surface", kind: "panel", name: "Surface" },
		{ id: "input.roughness", kind: "socket", parentId: "panel.surface", direction: "input", socketType: "float", defaultValue: 0.35 }
	],
	frames: [{ id: "frame.surface", label: "Surface Assembly" }],
	groups: [{ id: "group.detail", nodeIds: ["texture.a", "texture.b"] }],
	zones: [
		{ id: "zone.simulation", type: "simulation", inputNodeId: "texture.a", outputNodeId: "surface.mix", bodyNodeIds: ["texture.b"] },
		{ id: "zone.repeat", type: "repeat", inputNodeId: "texture.a", outputNodeId: "surface.mix", iterations: 4 },
		{ id: "zone.foreach", type: "foreach", inputNodeId: "texture.a", outputNodeId: "surface.mix", items: [{ id: "element", kind: "socket", socketType: "geometry" }] }
	]
};
const first = createUniversalNodeTree(input);
const second = createUniversalNodeTree(input);
assert.deepEqual(first, second);
assert.deepEqual(first.links.map(link => link.id), ["link.a", "link.b"]);
assert.equal(first.interfaceItems.length, 2);
assert.equal(first.zones.length, 3);
const validation = validateUniversalNodeTree(input);
assert.equal(validation.ok, true);
const plan = compileUniversalNodeTreePlan(input);
assert.equal(plan.linksByTarget["surface.mix.shader"].length, 2);
assert.equal(plan.coverage.represented, 3);
const parity = createNodeParityReport(input);
assert.equal(parity.coverage.represented, 3);
assert.ok(parity.missingExecution.includes("future.shader.texture"));
console.log('B"H | proceduralObjectUniversalNodeTree.test passed');
