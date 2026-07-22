// B"H
// Boruch Hashem
// Blessed is He
/** Link evidence proves authored order, inactive preservation, limits, and socket availability. */

import assert from "node:assert/strict";
import * as api from "../src/index.js";

const constant = api.createNodeDefinition({
	type: "text.constant",
	outputs: [{ id: "value", type: "string" }]
});
const gather = api.createNodeDefinition({
	type: "text.gather",
	inputs: [{
		id: "values",
		type: "string",
		multiInput: true,
		metadata: { linkLimit: 2 }
	}],
	outputs: [{ id: "value", type: "string" }]
});
const pass = api.createNodeDefinition({
	type: "text.pass",
	inputs: [{ id: "value", type: "string" }],
	outputs: [{ id: "value", type: "string" }]
});
const definitions = new api.NodeDefinitionRegistry();
definitions.register(constant);
definitions.register(gather);
definitions.register(pass);
const nodes = [
	{ id: "a", type: "text.constant", config: { value: "a" } },
	{ id: "b", type: "text.constant", config: { value: "b" } },
	{ id: "c", type: "text.constant", config: { value: "c" } },
	{ id: "gather", type: "text.gather" }
];
const links = [{
	id: "link.c", order: 2, muted: true,
	from: { nodeId: "c", socketId: "value" },
	to: { nodeId: "gather", socketId: "values" },
	metadata: { nativeIndex: 2 }
}, {
	id: "link.a", order: 1,
	from: { nodeId: "a", socketId: "value" },
	to: { nodeId: "gather", socketId: "values" }
}, {
	id: "link.b", order: 0,
	from: { nodeId: "b", socketId: "value" },
	to: { nodeId: "gather", socketId: "values" }
}];
const graphInput = {
	name: "ordered.links", kind: "geometry", nodes, links,
	outputs: { value: { nodeId: "gather", socketId: "value" } }
};
const graph = api.createUniversalNodeGraph(graphInput);
assert.deepEqual(graph.links.map(link => link.id), ["link.b", "link.a", "link.c"]);
assert.equal(graph.links[2].muted, true);
assert.equal(graph.links[2].metadata.nativeIndex, 2);
assert.equal(graph.contentHash, api.createUniversalNodeGraph({
	...graphInput,
	links: [...links].reverse()
}).contentHash);
const executors = new api.UniversalNodeExecutorRegistry();
executors.register({
	definition: { name: "text.constant", version: "1.0.0" },
	executor: ({ config }) => ({ value: config.value })
});
executors.register({
	definition: { name: "text.gather", version: "1.0.0" },
	executor: ({ inputs }) => ({ value: inputs.values.join("|") })
});
const evaluated = api.evaluateUniversalNodeGraph(graph, {
	definitionRegistry: definitions,
	executorRegistry: executors
});
assert.equal(evaluated.ok, true);
assert.equal(evaluated.outputs.value, "b|a");
const plans = api.validateUniversalNodeGraph(graph, {
	definitionRegistry: definitions
}).linkPlans;
assert.deepEqual(plans.map(plan => plan.multiInputSlot), [0, 1, null]);
assert.deepEqual(plans.map(plan => plan.active), [true, true, false]);

const overLimit = api.validateUniversalNodeGraph({
	...graphInput,
	links: links.map(link => ({ ...link, muted: false }))
}, { definitionRegistry: definitions });
assert.ok(overLimit.diagnostics.some(value => value.code === "NODE.LINK_LIMIT_EXCEEDED"));
const unavailable = api.validateUniversalNodeGraph({
	...graphInput,
	nodes: nodes.map(node => node.id === "gather"
		? { ...node, socketState: { values: { available: false } } }
		: node)
}, { definitionRegistry: definitions });
assert.ok(unavailable.diagnostics.some(value => value.code === "NODE.LINK_SOCKET_UNAVAILABLE"));
const single = api.validateUniversalNodeGraph({
	name: "single.links", kind: "geometry",
	nodes: [...nodes.slice(0, 2), { id: "pass", type: "text.pass" }],
	links: ["a", "b"].map((id, order) => ({
		id: `single.${id}`, order,
		from: { nodeId: id, socketId: "value" },
		to: { nodeId: "pass", socketId: "value" }
	})),
	outputs: { value: { nodeId: "pass", socketId: "value" } }
}, { definitionRegistry: definitions });
assert.ok(single.diagnostics.some(value => value.code === "NODE.MULTIPLE_INPUT_LINKS"));

console.log('B"H | proceduralObjectUniversalLinkSemantics.test passed');
