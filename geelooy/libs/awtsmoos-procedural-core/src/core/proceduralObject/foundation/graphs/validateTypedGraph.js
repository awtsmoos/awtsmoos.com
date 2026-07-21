// B"H

import { createDiagnostic } from "../diagnostics/index.js";
import { createTypedGraph } from "./createTypedGraph.js";
import { scheduleTypedGraph } from "./scheduleTypedGraph.js";

function diagnostic(code, message, path, metadata = {}) {
	return createDiagnostic({ code, message, path, metadata });
}

function graphValue(input) {
	return input?.graphSchema === "awtsmoos.typed-graph" ? input : createTypedGraph(input);
}

function validateSource(graph, nodes, source, expectedType, path, diagnostics) {
	if (source.kind === "graph-input") {
		const input = graph.inputs[source.input];
		if (!input) {
			diagnostics.push(diagnostic("GRAPH.INPUT_MISSING", "Graph input source does not exist.", path, { input: source.input }));
		} else if (input.type !== expectedType && input.type !== "any" && expectedType !== "any") {
			diagnostics.push(diagnostic("GRAPH.TYPE_MISMATCH", "Graph input type does not match port type.", path, { actual: input.type, expected: expectedType }));
		}
		return;
	}
	const node = nodes.get(source.nodeId);
	if (!node) {
		diagnostics.push(diagnostic("GRAPH.NODE_MISSING", "Source node does not exist.", path, { nodeId: source.nodeId }));
		return;
	}
	const outputType = node.outputs[source.port];
	if (!outputType) {
		diagnostics.push(diagnostic("GRAPH.PORT_MISSING", "Source output port does not exist.", path, { nodeId: source.nodeId, port: source.port }));
	} else if (outputType !== expectedType && outputType !== "any" && expectedType !== "any") {
		diagnostics.push(diagnostic("GRAPH.TYPE_MISMATCH", "Connected port types do not match.", path, { actual: outputType, expected: expectedType }));
	}
}

/** Returns a stable diagnostic report without executing any graph node. */
export function validateTypedGraph(input) {
	let graph;
	try {
		graph = graphValue(input);
	} catch (error) {
		return Object.freeze({
			ok: false, graph: null,
			diagnostics: Object.freeze([diagnostic("GRAPH.CONTRACT_INVALID", error.message, [])])
		});
	}
	const diagnostics = [];
	const nodes = new Map(graph.nodes.map(node => [node.id, node]));
	for (const node of graph.nodes) {
		for (const [port, binding] of Object.entries(node.inputs)) {
			if (binding.source) validateSource(graph, nodes, binding.source, binding.type, ["nodes", node.id, "inputs", port], diagnostics);
		}
	}
	for (const [name, output] of Object.entries(graph.outputs)) {
		validateSource(graph, nodes, output.source, output.type, ["outputs", name], diagnostics);
	}
	if (diagnostics.length === 0) {
		try {
			scheduleTypedGraph(graph);
		} catch (error) {
			diagnostics.push(diagnostic("GRAPH.CYCLE_DETECTED", error.message, ["nodes"], { nodes: error.cyclicNodes ?? [] }));
		}
	}
	return Object.freeze({ ok: diagnostics.length === 0, graph, diagnostics: Object.freeze(diagnostics) });
}
