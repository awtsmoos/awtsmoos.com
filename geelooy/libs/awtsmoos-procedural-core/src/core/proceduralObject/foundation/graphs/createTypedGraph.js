// B"H

import { assertStableId, createStableId } from "../artifacts/index.js";
import { normalizeResourceBudget } from "../budgets/index.js";
import { hashCanonicalValue, normalizeCanonicalValue } from "../canonical/index.js";
import { createGraphNode } from "./createGraphNode.js";
import { assertGraphName, normalizeGraphSource, normalizeGraphType } from "./graphContract.js";

const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

function normalizeGraphInputs(inputs) {
	if (!inputs || typeof inputs !== "object" || Array.isArray(inputs)) {
		throw new TypeError("Graph inputs must be an object.");
	}
	return Object.freeze(Object.fromEntries(Object.keys(inputs).sort().map(name => {
		const definition = inputs[name];
		if (!definition || typeof definition !== "object" || Array.isArray(definition)) {
			throw new TypeError(`Graph input definition must be an object: ${name}`);
		}
		return [assertGraphName(name, "Graph input name"), Object.freeze({
			type: normalizeGraphType(definition.type, `Graph input type for ${name}`),
			...(Object.hasOwn(definition, "default")
				? { default: normalizeCanonicalValue(definition.default) }
				: {})
		})];
	})));
}

function normalizeGraphOutputs(outputs) {
	if (!outputs || typeof outputs !== "object" || Array.isArray(outputs)) {
		throw new TypeError("Graph outputs must be an object.");
	}
	return Object.freeze(Object.fromEntries(Object.keys(outputs).sort().map(name => {
		const definition = outputs[name];
		if (!definition || typeof definition !== "object" || Array.isArray(definition)) {
			throw new TypeError(`Graph output definition must be an object: ${name}`);
		}
		return [assertGraphName(name, "Graph output name"), Object.freeze({
			type: normalizeGraphType(definition.type, `Graph output type for ${name}`),
			source: normalizeGraphSource(definition.source)
		})];
	})));
}

/** Creates an immutable content-addressed typed graph envelope. */
export function createTypedGraph(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Typed graph input must be an object.");
	}
	if (typeof input.version !== "string" || !VERSION_PATTERN.test(input.version)) {
		throw new TypeError("Typed graph version must be semantic version text.");
	}
	if (!Array.isArray(input.nodes)) throw new TypeError("Typed graph nodes must be an array.");
	const nodes = input.nodes.map(createGraphNode).sort((left, right) => (
		left.id < right.id ? -1 : left.id > right.id ? 1 : 0
	));
	if (new Set(nodes.map(node => node.id)).size !== nodes.length) {
		throw new Error("Typed graph node IDs must be unique.");
	}
	const content = Object.freeze({
		name: assertGraphName(input.name, "Typed graph name"),
		version: input.version,
		inputs: normalizeGraphInputs(input.inputs ?? {}),
		outputs: normalizeGraphOutputs(input.outputs ?? {}),
		nodes: Object.freeze(nodes),
		resourceBudget: normalizeResourceBudget(input.resourceBudget ?? {}),
		metadata: normalizeCanonicalValue(input.metadata ?? {})
	});
	const contentHash = hashCanonicalValue(content);
	return Object.freeze({
		graphSchema: "awtsmoos.typed-graph",
		id: input.id == null ? createStableId("graph", content) : assertStableId(input.id, "Graph id"),
		contentHash,
		...content
	});
}
