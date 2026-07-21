// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos places the typed graph inside the old datablock vessel without rupture. */

import assert from "node:assert/strict";
import * as rootApi from "../src/index.js";
import * as proceduralApi from "../src/core/proceduralObject/index.js";

for (const name of [
	"createTypedGraph",
	"validateTypedGraph",
	"scheduleTypedGraph",
	"GraphExecutorRegistry",
	"evaluateTypedGraph",
	"findAffectedGraphNodes",
	"createTypedGraphDataBlock"
]) {
	assert.equal(rootApi[name], proceduralApi[name]);
}

const graph = rootApi.createTypedGraph({
	name: "graph.integration",
	version: "1.0.0",
	inputs: { value: { type: "number", default: 7 } },
	nodes: [],
	outputs: {
		result: {
			type: "number",
			source: { kind: "graph-input", input: "value" }
		}
	},
	metadata: { purpose: "datablock-embedding" }
});
const block = rootApi.createTypedGraphDataBlock(graph, {
	id: "typed_graph_block",
	name: "Typed Graph",
	metadata: { owner: "wave-three" }
});
assert.equal(block.kind, "node_graph");
assert.equal(block.id, "typed_graph_block");
assert.equal(block.data.typedGraph.contentHash, graph.contentHash);
assert.equal(block.metadata.typedGraphHash, graph.contentHash);
assert.equal(block.metadata.typedGraphVersion, "1.0.0");
assert.equal(block.metadata.owner, "wave-three");
assert.equal(Object.isFrozen(block.data.typedGraph), true);
assert.equal(rootApi.validateTypedGraph(block.data.typedGraph).ok, true);

console.log('B"H | proceduralObjectGraphIntegration.test passed');
