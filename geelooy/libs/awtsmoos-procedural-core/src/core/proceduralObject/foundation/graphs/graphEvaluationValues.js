// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos opens canonical graph values only at trusted execution borders.
 * Awtsmoos.com preserves ordered multi-input confluence without flattening,
 * re-normalizing, or losing the semantic identity of upstream results.
 */

import {
	CANONICAL_VALUE_TAGS,
	normalizeCanonicalValue
} from "../canonical/index.js";
import { valueMatchesGraphType } from "./graphContract.js";

function requiredGraphInput(graph, provided, name) {
	const definition = graph.inputs[name];
	if (Object.hasOwn(provided, name)) {
		return normalizeCanonicalValue(provided[name]);
	}
	if (Object.hasOwn(definition, "default")) {
		return definition.default;
	}
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

function resolveSource(source, graphInputs, nodeResults) {
	if (source.kind === "graph-input") {
		return graphInputs[source.input];
	}
	const output = nodeResults[source.nodeId]?.[source.port];
	if (output === undefined) {
		throw new Error(
			`Upstream graph output is unavailable: ${source.nodeId}.${source.port}`
		);
	}
	return output;
}

function canonicalSourceArray(sources, graphInputs, nodeResults) {
	return Object.freeze({
		type: CANONICAL_VALUE_TAGS.ARRAY,
		items: Object.freeze(sources.map((source) => (
			resolveSource(source, graphInputs, nodeResults)
		)))
	});
}

/** Resolves one normalized node binding from literals or ordered sources. */
export function resolveNodeBinding(binding, graphInputs, nodeResults) {
	if (Object.hasOwn(binding, "value")) {
		return binding.value;
	}
	if (binding.source) {
		return resolveSource(binding.source, graphInputs, nodeResults);
	}
	return canonicalSourceArray(binding.sources, graphInputs, nodeResults);
}

/** Normalizes and validates an executor's declared node outputs. */
export function normalizeNodeOutputs(node, outputInput) {
	if (!outputInput || typeof outputInput !== "object" || Array.isArray(outputInput)) {
		throw new TypeError(`Graph executor must return an output object: ${node.id}`);
	}
	const result = {};
	for (const [name, type] of Object.entries(node.outputs)) {
		if (!Object.hasOwn(outputInput, name)) {
			throw new Error(`Graph node output is missing: ${node.id}.${name}`);
		}
		const value = normalizeCanonicalValue(outputInput[name]);
		if (!valueMatchesGraphType(value, type)) {
			throw new TypeError(`Graph node output type mismatch: ${node.id}.${name}`);
		}
		result[name] = value;
	}
	return Object.freeze(result);
}
