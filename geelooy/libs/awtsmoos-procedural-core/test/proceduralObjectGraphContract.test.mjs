// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos reveals one lawful order beneath every shuffled graph declaration. */

import assert from "node:assert/strict";
import {
	createTypedGraph,
	scheduleTypedGraph,
	validateTypedGraph
} from "../src/core/proceduralObject/index.js";

function node(id, inputs = {}, operation = "math.value") {
	return {
		id,
		operation: { name: operation, version: "1.0.0" },
		inputs,
		outputs: { value: "number" }
	};
}

function graph(nodes) {
	return {
		name: "graph.contract",
		version: "1.0.0",
		inputs: { external: { type: "number", default: 1 } },
		nodes,
		outputs: {
			result: { type: "number", source: { kind: "node", nodeId: "c", port: "value" } }
		}
	};
}

const a = node("a", { value: { type: "number", value: 2 } });
const b = node("b", { value: { type: "number", source: { kind: "graph-input", input: "external" } } });
const c = node("c", {
	left: { type: "number", source: { kind: "node", nodeId: "a", port: "value" } },
	right: { type: "number", source: { kind: "node", nodeId: "b", port: "value" } }
}, "math.add");
const first = createTypedGraph(graph([c, b, a]));
const second = createTypedGraph(graph([a, c, b]));
assert.deepEqual(first.nodes.map(item => item.id), ["a", "b", "c"]);
assert.equal(first.contentHash, second.contentHash);
assert.deepEqual(scheduleTypedGraph(first), ["a", "b", "c"]);
assert.equal(validateTypedGraph(first).ok, true);
assert.equal(Object.isFrozen(first.nodes), true);

assert.throws(
	() => createTypedGraph(graph([a, a, c])),
	/must be unique/
);

const missing = createTypedGraph(graph([
	node("c", {
		left: { type: "number", source: { kind: "node", nodeId: "absent", port: "value" } }
	}, "math.add")
]));
const missingReport = validateTypedGraph(missing);
assert.equal(missingReport.ok, false);
assert.equal(missingReport.diagnostics[0].code, "GRAPH.NODE_MISSING");

const mismatch = createTypedGraph(graph([
	node("c", {
		left: { type: "string", source: { kind: "graph-input", input: "external" } }
	}, "math.add")
]));
assert.equal(validateTypedGraph(mismatch).diagnostics[0].code, "GRAPH.TYPE_MISMATCH");

const cycle = createTypedGraph({
	name: "graph.cycle",
	version: "1.0.0",
	nodes: [
		node("a", { value: { type: "number", source: { kind: "node", nodeId: "b", port: "value" } } }),
		node("b", { value: { type: "number", source: { kind: "node", nodeId: "a", port: "value" } } })
	],
	outputs: { result: { type: "number", source: { kind: "node", nodeId: "a", port: "value" } } }
});
const cycleReport = validateTypedGraph(cycle);
assert.equal(cycleReport.ok, false);
assert.equal(cycleReport.diagnostics[0].code, "GRAPH.CYCLE_DETECTED");

console.log('B"H | proceduralObjectGraphContract.test passed');
