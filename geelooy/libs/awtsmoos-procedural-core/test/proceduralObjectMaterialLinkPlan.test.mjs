// B"H
// Boruch Hashem
// Blessed is He
/** Material-link evidence proves closure conversions, backend support, and local refusal. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const surface = api.createNodeDefinition({
	type: "shader.surface-source",
	outputs: [{ id: "surface", type: "shader.surface" }]
});
const generic = api.createNodeDefinition({
	type: "shader.generic-sink",
	inputs: [{ id: "shader", type: "shader" }],
	outputs: [{ id: "shader", type: "shader" }]
});
const exact = api.createNodeDefinition({
	type: "shader.surface-sink",
	inputs: [{ id: "surface", type: "shader.surface" }],
	outputs: [{ id: "surface", type: "shader.surface" }]
});
const definitions = new api.NodeDefinitionRegistry();
definitions.register(surface);
definitions.register(generic);
definitions.register(exact);
const conversionGraph = api.createUniversalNodeGraph({
	name: "material.links", kind: "material",
	nodes: [
		{ id: "source", type: "shader.surface-source" },
		{ id: "sink", type: "shader.generic-sink" }
	],
	links: [{
		id: "surface.generic", order: 0,
		from: { nodeId: "source", socketId: "surface" },
		to: { nodeId: "sink", socketId: "shader" },
		metadata: { nativeLink: "material-output" }
	}],
	outputs: { shader: { nodeId: "sink", socketId: "shader" } }
});
const unsupported = api.createMaterialCompilePlan(conversionGraph, {
	definitionRegistry: definitions,
	backend: {
		id: "backend.strict",
		supportedNodeTypes: ["shader.surface-source", "shader.generic-sink"],
		supportedConversions: []
	}
});
assert.equal(unsupported.ok, false);
assert.deepEqual(unsupported.requiredConversions, ["shader.surface-to-shader"]);
assert.deepEqual(unsupported.unsupportedConversions, ["shader.surface-to-shader"]);
assert.equal(unsupported.linkPlans[0].lossiness, "contextual");
assert.equal(unsupported.linkPlans[0].backendStatus, "unsupported-conversion");
assert.equal(unsupported.linkPlans[0].metadata.nativeLink, "material-output");
const supported = api.createMaterialCompilePlan(conversionGraph, {
	definitionRegistry: definitions,
	backend: {
		id: "backend.closures",
		supportedNodeTypes: ["shader.surface-source", "shader.generic-sink"],
		supportedConversions: ["shader.surface-to-shader"]
	}
});
assert.equal(supported.ok, true);
assert.equal(supported.linkPlans[0].backendStatus, "supported");
const local = api.compileUniversalNodeGraph(conversionGraph, {
	definitionRegistry: definitions
});
assert.equal(local.ok, false);
assert.equal(local.requiresAdapterConversions, true);
assert.equal(local.diagnostics[0].code, "NODE.CONVERSION_EXECUTOR_REQUIRED");

const exactGraph = api.createUniversalNodeGraph({
	name: "material.exact", kind: "material",
	nodes: [
		{ id: "source", type: "shader.surface-source" },
		{ id: "sink", type: "shader.surface-sink" }
	],
	links: [{
		id: "surface.exact", order: 0,
		from: { nodeId: "source", socketId: "surface" },
		to: { nodeId: "sink", socketId: "surface" }
	}],
	outputs: { surface: { nodeId: "sink", socketId: "surface" } }
});
const exactCompiled = api.compileUniversalNodeGraph(exactGraph, {
	definitionRegistry: definitions
});
assert.equal(exactCompiled.ok, true);
assert.equal(exactCompiled.requiresAdapterConversions, false);
assert.equal(exactCompiled.linkPlans[0].conversion, null);

const mutedGraph = api.createUniversalNodeGraph({
	...conversionGraph,
	name: "material.muted",
	links: conversionGraph.links.map(link => ({ ...link, muted: true }))
});
const muted = api.createMaterialCompilePlan(mutedGraph, {
	definitionRegistry: definitions,
	backend: {
		id: "backend.strict",
		supportedNodeTypes: ["shader.surface-source", "shader.generic-sink"],
		supportedConversions: []
	}
});
assert.equal(muted.ok, true);
assert.deepEqual(muted.requiredConversions, []);
assert.equal(muted.linkPlans[0].backendStatus, "inactive");

console.log('B"H | proceduralObjectMaterialLinkPlan.test passed');
