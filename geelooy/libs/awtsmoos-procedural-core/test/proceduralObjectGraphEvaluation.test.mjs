// B"H
// Boruch Hashem
/** Trusted graph tools execute; serialized graph data never carries a function. */

import assert from "node:assert/strict";
import {
	createTypedGraph,
	evaluateTypedGraph,
	findAffectedGraphNodes,
	GraphExecutorRegistry
} from "../src/core/proceduralObject/index.js";

const calls = { value: 0, add: 0 };
const registry = new GraphExecutorRegistry();
function register(name, executor, determinism = "deterministic") {
	registry.register({
		definition: { name, version: "1.0.0", determinism },
		executor
	});
}
register("math.value", ({ inputs }) => {
	calls.value += 1;
	return { value: inputs.value };
});
register("math.add", ({ inputs }) => {
	calls.add += 1;
	return { value: inputs.left + inputs.right };
});
register("math.seeded", ({ seed }) => ({ value: seed }), "seeded");
register("io.external", () => ({ value: 9 }), "external");
register("math.bad", () => ({ value: "not-a-number" }));

function source(nodeId) {
	return { kind: "node", nodeId, port: "value" };
}
function arithmeticGraph(resourceBudget = {}) {
	return createTypedGraph({
		name: "graph.arithmetic",
		version: "1.0.0",
		inputs: { right: { type: "number" } },
		nodes: [
			{
				id: "a",
				operation: { name: "math.value", version: "1.0.0" },
				inputs: { value: { type: "number", value: 2 } },
				outputs: { value: "number" }
			},
			{
				id: "b",
				operation: { name: "math.add", version: "1.0.0" },
				inputs: {
					left: { type: "number", source: source("a") },
					right: { type: "number", source: { kind: "graph-input", input: "right" } }
				},
				outputs: { value: "number" }
			}
		],
		outputs: { result: { type: "number", source: source("b") } },
		resourceBudget
	});
}
function singleNodeGraph(name, options = {}) {
	return createTypedGraph({
		name: `graph.${name}`,
		version: "1.0.0",
		nodes: [{
			id: "node",
			operation: { name, version: "1.0.0" },
			inputs: {},
			outputs: { value: "number" },
			...options
		}],
		outputs: { result: { type: "number", source: source("node") } }
	});
}

const cache = new Map();
const graph = arithmeticGraph({ operations: 2, bytes: 1000 });
const first = evaluateTypedGraph(graph, { registry, inputs: { right: 3 }, cache });
assert.equal(first.ok, true);
assert.equal(first.outputs.result, 5);
assert.deepEqual(first.schedule, ["a", "b"]);
assert.deepEqual(calls, { value: 1, add: 1 });
const second = evaluateTypedGraph(graph, { registry, inputs: { right: 3 }, cache });
assert.equal(second.cacheHits, 2);
assert.deepEqual(calls, { value: 1, add: 1 });
assert.equal(second.contentHash, first.contentHash);
assert.deepEqual(findAffectedGraphNodes(graph, ["a"]), ["a", "b"]);

const overBudget = evaluateTypedGraph(arithmeticGraph({ operations: 1 }), {
	registry,
	inputs: { right: 3 }
});
assert.equal(overBudget.resourceReport.ok, false);
assert.equal(overBudget.diagnostics[0].code, "RESOURCE.BUDGET_EXCEEDED");
assert.equal(evaluateTypedGraph(singleNodeGraph("io.external"), { registry }).ok, false);
assert.equal(evaluateTypedGraph(singleNodeGraph("io.external"), { registry, allowExternal: true }).outputs.result, 9);
assert.equal(evaluateTypedGraph(singleNodeGraph("math.seeded", { seed: 7 }), { registry }).outputs.result, 7);
assert.equal(evaluateTypedGraph(singleNodeGraph("math.seeded"), { registry }).ok, false);
assert.equal(evaluateTypedGraph(singleNodeGraph("math.bad"), { registry }).diagnostics[0].code, "GRAPH.EXECUTION_FAILED");

console.log('B"H | proceduralObjectGraphEvaluation.test passed');
