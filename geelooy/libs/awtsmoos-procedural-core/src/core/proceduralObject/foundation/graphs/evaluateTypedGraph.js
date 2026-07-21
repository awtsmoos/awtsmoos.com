// B"H

import { evaluateResourceBudget } from "../budgets/index.js";
import { hashCanonicalValue, serializeCanonicalValue } from "../canonical/index.js";
import { createDiagnostic } from "../diagnostics/index.js";
import { graphValueMatchesType } from "./runtimeType.js";
import { resolveGraphInputs, resolveNodeBinding, normalizeNodeOutputs } from "./graphEvaluationValues.js";
import { scheduleTypedGraph } from "./scheduleTypedGraph.js";
import { validateTypedGraph } from "./validateTypedGraph.js";

function failure(graph, diagnostics, usage = { operations: 0, bytes: 0 }, resourceReport = null) {
	return Object.freeze({ ok: false, graph, schedule: Object.freeze([]), nodeResults: Object.freeze({}), outputs: Object.freeze({}), usage: Object.freeze(usage), resourceReport, cacheHits: 0, diagnostics: Object.freeze(diagnostics), contentHash: null });
}

function executionDiagnostic(code, message, path, metadata = {}) {
	return createDiagnostic({ code, message, path, metadata });
}

function outputValues(graph, graphInputs, nodeResults) {
	const outputs = {};
	for (const [name, definition] of Object.entries(graph.outputs)) {
		const source = definition.source;
		const value = source.kind === "graph-input"
			? graphInputs[source.input]
			: nodeResults[source.nodeId][source.port];
		if (!graphValueMatchesType(value, definition.type)) throw new TypeError(`Graph output type mismatch: ${name}`);
		outputs[name] = value;
	}
	return Object.freeze(outputs);
}

/** Executes a validated typed graph synchronously through a trusted executor registry. */
export function evaluateTypedGraph(graphInput, options = {}) {
	const validation = validateTypedGraph(graphInput);
	if (!validation.ok) return failure(validation.graph, validation.diagnostics);
	const graph = validation.graph;
	const registry = options.registry;
	if (!registry || typeof registry.resolve !== "function") throw new TypeError("Typed graph evaluation requires an executor registry.");
	const cache = options.cache ?? new Map();
	const nodeResults = {};
	let operations = 0;
	let bytes = 0;
	let cacheHits = 0;
	let schedule;
	try {
		const graphInputs = resolveGraphInputs(graph, options.inputs ?? {});
		schedule = scheduleTypedGraph(graph);
		for (const nodeId of schedule) {
			const node = graph.nodes.find(candidate => candidate.id === nodeId);
			const entry = registry.resolve(node.operation.name, node.operation.version);
			if (!entry) throw new Error(`Graph executor is not registered: ${node.operation.name}@${node.operation.version}`);
			if (entry.definition.determinism === "external" && options.allowExternal !== true) throw new Error(`External graph executor is denied: ${node.id}`);
			if (entry.definition.determinism === "seeded" && node.seed == null) throw new Error(`Seeded graph node requires a seed: ${node.id}`);
			const inputs = Object.freeze(Object.fromEntries(Object.entries(node.inputs).map(([name, binding]) => [name, resolveNodeBinding(binding, graphInputs, nodeResults)])));
			const key = hashCanonicalValue({ operation: node.operation, inputs, config: node.config, seed: node.seed });
			let outputs = cache.get(key);
			if (outputs) cacheHits += 1;
			else {
				outputs = normalizeNodeOutputs(node, entry.executor(Object.freeze({ inputs, config: node.config, seed: node.seed, node, graph })));
				cache.set(key, outputs);
			}
			nodeResults[nodeId] = outputs;
			operations += 1;
			bytes += new TextEncoder().encode(serializeCanonicalValue(outputs)).byteLength;
			const report = evaluateResourceBudget(graph.resourceBudget, { operations, bytes });
			if (!report.ok) return failure(graph, report.diagnostics, { operations, bytes }, report);
		}
		const outputs = outputValues(graph, graphInputs, nodeResults);
		return Object.freeze({ ok: true, graph, schedule, nodeResults: Object.freeze(nodeResults), outputs, usage: Object.freeze({ operations, bytes }), resourceReport: evaluateResourceBudget(graph.resourceBudget, { operations, bytes }), cacheHits, diagnostics: Object.freeze([]), contentHash: hashCanonicalValue({ graph: graph.contentHash, outputs }) });
	} catch (error) {
		return failure(graph, [executionDiagnostic("GRAPH.EXECUTION_FAILED", error.message, [])], { operations, bytes });
	}
}
