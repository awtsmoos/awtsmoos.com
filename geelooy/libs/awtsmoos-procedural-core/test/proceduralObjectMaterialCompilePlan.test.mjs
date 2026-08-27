// B"H
// Boruch Hashem
// Blessed is He
/** Material planning evidence proves backend support is explicit rather than assumed. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const noise = api.createNodeDefinition({
	type: "texture.noise",
	outputs: [{ id: "color", type: "color" }],
	metadata: { requiredCapabilities: ["procedural-noise"] }
});
const principled = api.createNodeDefinition({
	type: "shader.principled",
	inputs: [{ id: "base-color", type: "color" }],
	outputs: [{ id: "surface", type: "shader.surface" }],
	metadata: { requiredCapabilities: ["surface-closure"] }
});
const definitions = new api.NodeDefinitionRegistry();
definitions.register(noise);
definitions.register(principled);
const graph = api.createUniversalNodeGraph({
	name: "material.graph", kind: "material",
	nodes: [
		{ id: "noise", type: "texture.noise" },
		{ id: "surface", type: "shader.principled" }
	],
	links: [{
		from: { nodeId: "noise", socketId: "color" },
		to: { nodeId: "surface", socketId: "base-color" }
	}],
	outputs: { surface: { nodeId: "surface", socketId: "surface" } }
});
const partial = api.createMaterialCompilePlan(graph, {
	definitionRegistry: definitions,
	backend: { id: "backend.partial", supportedNodeTypes: ["shader.principled"] }
});
assert.equal(partial.ok, false);
assert.deepEqual(partial.unsupportedNodeTypes, ["texture.noise"]);
assert.deepEqual(partial.requiredCapabilities, ["procedural-noise", "surface-closure"]);
const complete = api.createMaterialCompilePlan(graph, {
	definitionRegistry: definitions,
	backend: {
		id: "backend.complete",
		supportedNodeTypes: ["shader.principled", "texture.noise"]
	}
});
assert.equal(complete.ok, true);
assert.equal(complete.unsupportedNodeTypes.length, 0);
assert.equal(complete.contentHash, api.createMaterialCompilePlan(graph, {
	definitionRegistry: definitions,
	backend: { id: "backend.complete", supportedNodeTypes: ["texture.noise", "shader.principled"] }
}).contentHash);

console.log('B"H | proceduralObjectMaterialCompilePlan.test passed');
