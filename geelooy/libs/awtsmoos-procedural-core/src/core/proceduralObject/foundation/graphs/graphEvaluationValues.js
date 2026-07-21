// B"H

import { normalizeCanonicalValue } from "../canonical/index.js";
import { valueMatchesGraphType } from "./graphContract.js";

function requiredGraphInput(graph, provided, name) {
	const definition = graph.inputs[name];
	if (Object.hasOwn(provided, name)) return normalizeCanonicalValue(provided[name]);
	if (Object.hasOwn(definition, "default")) return definition.default;
	throw new Error(`Required graph input is missing: ${name}`);
}

/** Normalizes and validates runtime graph inputs. */
export function resolveGraphInputs(graph, provided = {}) {
	if (!provided || typeof provided !== "object" || Array.isArray(provided)) {
		throw new TypeError("Runtime graph inputs must be an object.");
	}
	const result = {};
	for (const [name, definition] of Object.entries(graph.inputs)) {
		const value = requiredGraphInput(graph, provided, name);
		if (!valueMatchesGraphType(value, definition.type)) {
			throw new TypeError(`Runtime graph input type mismatch: ${name}`);
		}
		result[name] = value;
	}
	return Object.freeze(result);
}

/** Resolves one normalized node binding from literals, graph inputs, or node outputs. */
export function resolveNodeBinding(binding, graphInputs, nodeResults) {
	if (Object.hasOwn(binding, "value")) return binding.value;
	if (binding.source.kind === "graph-input") return graphInputs[binding.source.input];
	const output = nodeResults[binding.source.nodeId]?.[binding.source.port];
	if (output === undefined) {
		throw new Error(`Upstream graph output is unavailable: ${binding.source.nodeId}.${binding.source.port}`);
	}
	return output;
}

/** Normalizes and validates an executor's declared node outputs. */
export function normalizeNodeOutputs(node, outputInput) {
	if (!outputInput || typeof outputInput !== "object" || Array.isArray(outputInput)) {
		throw new TypeError(`Graph executor must return an output object: ${node.id}`);
	}
	const result = {};
	for (const [name, type] of Object.entries(node.outputs)) {
		if (!Object.hasOwn(outputInput, name)) throw new Error(`Graph node output is missing: ${node.id}.${name}`);
		const value = normalizeCanonicalValue(outputInput[name]);
		if (!valueMatchesGraphType(value, type)) throw new TypeError(`Graph node output type mismatch: ${node.id}.${name}`);
		result[name] = value;
	}
	return Object.freeze(result);
}
