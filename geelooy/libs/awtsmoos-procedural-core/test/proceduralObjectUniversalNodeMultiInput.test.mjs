// B"H
// Boruch Hashem
// Blessed is He
/** Awtsmoos.com proves ordered native multi-input execution and hashing. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const source = api.createNodeDefinition({
	type: "test.geometry-source",
	outputs: [{ id: "geometry", type: "geometry" }]
});
const join = api.createNodeDefinition({
	type: "test.geometry-join",
	inputs: [{
		id: "geometries",
		type: "geometry",
		multiInput: true
	}],
	outputs: [{ id: "geometry", type: "geometry" }]
});
const definitions = new api.NodeDefinitionRegistry().registerPack(
	api.createNodeSchemaPack({
		name: "schema.test-multi-input",
		version: "1.0.0",
		family: "geometry",
		definitions: [source, join]
	})
);
const executors = new api.UniversalNodeExecutorRegistry();
executors.register({
	definition: {
		name: "test.geometry-source",
		version: "1.0.0"
	},
	executor: ({ config }) => ({
		geometry: {
			id: config.id,
			vertices: config.vertices
		}
	})
});
executors.register({
	definition: {
		name: "test.geometry-join",
		version: "1.0.0"
	},
	executor: ({ inputs }) => ({
		geometry: {
			ids: inputs.geometries.map((geometry) => geometry.id),
			vertexCount: inputs.geometries.reduce(
				(total, geometry) => total + geometry.vertices,
				0
			)
		}
	})
});

function createGraph() {
	return api.createUniversalNodeGraph({
		name: "test.multi-input-graph",
		kind: "geometry",
		nodes: [
			{
				id: "source-b",
				type: "test.geometry-source",
				config: { id: "b", vertices: 8 }
			},
			{
				id: "source-a",
				type: "test.geometry-source",
				config: { id: "a", vertices: 4 }
			},
			{
				id: "join",
				type: "test.geometry-join"
			}
		],
		links: [
			{
				from: { nodeId: "source-b", socketId: "geometry" },
				to: { nodeId: "join", socketId: "geometries" }
			},
			{
				from: { nodeId: "source-a", socketId: "geometry" },
				to: { nodeId: "join", socketId: "geometries" }
			}
		],
		outputs: {
			geometry: {
				nodeId: "join",
				socketId: "geometry"
			}
		}
	});
}

const first = api.evaluateUniversalNodeGraph(createGraph(), {
	definitionRegistry: definitions,
	executorRegistry: executors
});
const second = api.evaluateUniversalNodeGraph(createGraph(), {
	definitionRegistry: definitions,
	executorRegistry: executors
});
assert.equal(first.ok, true);
assert.deepEqual(first.outputs.geometry.ids, ["a", "b"]);
assert.equal(first.outputs.geometry.vertexCount, 12);
assert.deepEqual(first.schedule, ["source-a", "source-b", "join"]);
assert.equal(second.contentHash, first.contentHash);

const compiled = api.compileUniversalNodeGraph(createGraph(), {
	definitionRegistry: definitions
});
assert.equal(compiled.ok, true);
const binding = compiled.typedGraph.nodes.find(
	(node) => node.id === "join"
).inputs.geometries;
assert.equal(binding.type, "array");
assert.equal(binding.itemType, "geometry");
assert.deepEqual(
	binding.sources.map((sourceBinding) => sourceBinding.nodeId),
	["source-a", "source-b"]
);

console.log('B"H | proceduralObjectUniversalNodeMultiInput.test passed');
