// B"H
// Boruch Hashem
// Blessed is He
/** Universal graph evidence proves schema packs, opaque preservation, validation, and execution. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const constant = api.createNodeDefinition({
	type: "math.constant",
	outputs: [{ id: "value", type: "float" }]
});
const add = api.createNodeDefinition({
	type: "math.add",
	inputs: [{ id: "a", type: "float" }, { id: "b", type: "float" }],
	outputs: [{ id: "value", type: "float" }]
});
const pack = api.createNodeSchemaPack({
	name: "schema.math",
	version: "1.0.0",
	family: "geometry",
	definitions: [add, constant]
});
const definitions = new api.NodeDefinitionRegistry().registerPack(pack);
assert.equal(definitions.size, 2);
const opaque = api.createOpaqueBlenderNodeDefinition({
	nativeType: "GeometryNodeFutureThing",
	treeType: "GeometryNodeTree",
	blenderVersion: "5.2.0",
	inputs: [{ identifier: "Input_1", name: "Input", type: "geometry" }],
	outputs: [{ identifier: "Output_1", name: "Output", type: "geometry" }],
	properties: { mode: "FUTURE" }
});
assert.equal(opaque.metadata.opaque, true);
assert.equal(opaque.metadata.nativeType, "GeometryNodeFutureThing");

const graph = api.createUniversalNodeGraph({
	name: "math.graph", kind: "geometry",
	nodes: [
		{ id: "a", type: "math.constant", config: { value: 2 } },
		{ id: "b", type: "math.constant", config: { value: 3 } },
		{ id: "sum", type: "math.add" }
	],
	links: [
		{ from: { nodeId: "a", socketId: "value" }, to: { nodeId: "sum", socketId: "a" } },
		{ from: { nodeId: "b", socketId: "value" }, to: { nodeId: "sum", socketId: "b" } }
	],
	outputs: { value: { nodeId: "sum", socketId: "value" } }
});
const executors = new api.UniversalNodeExecutorRegistry();
executors.register({ definition: { name: "math.constant", version: "1.0.0" }, executor: ({ config }) => ({ value: config.value }) });
executors.register({ definition: { name: "math.add", version: "1.0.0" }, executor: ({ inputs }) => ({ value: inputs.a + inputs.b }) });
const result = api.evaluateUniversalNodeGraph(graph, { definitionRegistry: definitions, executorRegistry: executors });
assert.equal(result.ok, true);
assert.equal(result.outputs.value, 5);
assert.deepEqual(result.schedule, ["a", "b", "sum"]);

console.log('B"H | proceduralObjectUniversalNodeGraph.test passed');
