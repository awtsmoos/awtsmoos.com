// B"H
// Boruch Hashem
// Blessed is He
/** Universal evaluation opens canonical outputs only after trusted graph execution. */

import { decodeCanonicalValue } from "../foundation/canonical/index.js";
import { evaluateTypedGraph } from "../foundation/graphs/evaluateTypedGraph.js";
import { compileUniversalNodeGraph } from "./compileUniversalNodeGraph.js";

function decodeRecord(record) {
	return Object.freeze(Object.fromEntries(
		Object.entries(record).map(([name, value]) => [name, decodeCanonicalValue(value)])
	));
}

function decodeNodeResults(nodeResults) {
	return Object.freeze(Object.fromEntries(
		Object.entries(nodeResults).map(([nodeId, outputs]) => [nodeId, decodeRecord(outputs)])
	));
}

export function evaluateUniversalNodeGraph(input, options = {}) {
	const compiled = compileUniversalNodeGraph(input, options);
	if (!compiled.ok) {
		return Object.freeze({
			ok: false,
			graph: compiled.graph,
			typedGraph: null,
			outputs: Object.freeze({}),
			nodeResults: Object.freeze({}),
			diagnostics: compiled.diagnostics
		});
	}
	const executorRegistry = options.executorRegistry ?? options.executionRegistry;
	if (!executorRegistry || typeof executorRegistry.resolve !== "function") {
		throw new TypeError("Universal graph evaluation requires an executorRegistry.");
	}
	const evaluated = evaluateTypedGraph(compiled.typedGraph, {
		...options,
		registry: executorRegistry
	});
	if (!evaluated.ok) {
		return Object.freeze({
			...evaluated,
			graph: compiled.graph,
			typedGraph: compiled.typedGraph
		});
	}
	return Object.freeze({
		...evaluated,
		graph: compiled.graph,
		typedGraph: compiled.typedGraph,
		outputs: decodeRecord(evaluated.outputs),
		nodeResults: decodeNodeResults(evaluated.nodeResults)
	});
}
