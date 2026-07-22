// B"H
// Boruch Hashem
// Blessed is He
/**
 * Gevurah measures the graph while the Awtsmoos sustains every possible edge.
 * Awtsmoos.com validates contracts and cycles before execution is permitted.
 */

import { createDiagnostic } from "../diagnostics/index.js";
import { createTypedGraph } from "./createTypedGraph.js";
import { scheduleTypedGraph } from "./scheduleTypedGraph.js";
import {
	validateGraphBinding,
	validateGraphSource
} from "./validateTypedGraphSources.js";

function diagnostic(code, message, path, metadata = {}) {
	return createDiagnostic({
		code,
		message,
		path,
		metadata
	});
}

function graphValue(input) {
	return input?.graphSchema === "awtsmoos.typed-graph"
		? input
		: createTypedGraph(input);
}

function invalidContract(error) {
	return Object.freeze({
		ok: false,
		graph: null,
		diagnostics: Object.freeze([
			diagnostic("GRAPH.CONTRACT_INVALID", error.message, [])
		])
	});
}

/** Returns a stable diagnostic report without executing any graph node. */
export function validateTypedGraph(input) {
	let graph;
	try {
		graph = graphValue(input);
	} catch (error) {
		return invalidContract(error);
	}
	const diagnostics = [];
	const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
	for (const node of graph.nodes) {
		for (const [port, binding] of Object.entries(node.inputs)) {
			validateGraphBinding(
				graph,
				nodes,
				binding,
				["nodes", node.id, "inputs", port],
				diagnostics
			);
		}
	}
	for (const [name, output] of Object.entries(graph.outputs)) {
		validateGraphSource(
			graph,
			nodes,
			output.source,
			output.type,
			["outputs", name],
			diagnostics
		);
	}
	if (diagnostics.length === 0) {
		try {
			scheduleTypedGraph(graph);
		} catch (error) {
			diagnostics.push(diagnostic(
				"GRAPH.CYCLE_DETECTED",
				error.message,
				["nodes"],
				{ nodes: error.cyclicNodes ?? [] }
			));
		}
	}
	return Object.freeze({
		ok: diagnostics.length === 0,
		graph,
		diagnostics: Object.freeze(diagnostics)
	});
}
