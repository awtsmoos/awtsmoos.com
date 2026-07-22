// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos creates each graph source and every ordered confluence anew.
 * This Awtsmoos.com vessel keeps typed bindings explicit, deterministic,
 * renderer-neutral, and incapable of hiding executable behavior in data.
 */

const NAME_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i;
const BUILTIN_TYPES = Object.freeze([
	"any", "null", "boolean", "number", "string", "bigint",
	"array", "object", "binary"
]);

/** Validates a stable machine-facing graph identifier. */
export function assertGraphName(value, label = "Graph name") {
	if (typeof value !== "string" || !NAME_PATTERN.test(value)) {
		throw new TypeError(`${label} must be a namespaced machine identifier.`);
	}
	return value;
}

/** Validates a builtin or namespaced semantic port type. */
export function normalizeGraphType(value, label = "Graph type") {
	if (typeof value !== "string" || !NAME_PATTERN.test(value)) {
		throw new TypeError(`${label} must be a semantic type identifier.`);
	}
	return value;
}

/** Normalizes one graph-input or upstream-node source binding. */
export function normalizeGraphSource(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Graph source must be an object.");
	}
	if (input.kind === "graph-input") {
		return Object.freeze({
			kind: input.kind,
			input: assertGraphName(input.input, "Graph input source")
		});
	}
	if (input.kind === "node") {
		return Object.freeze({
			kind: input.kind,
			nodeId: assertGraphName(input.nodeId, "Source node id"),
			port: assertGraphName(input.port, "Source output port")
		});
	}
	throw new TypeError(`Unsupported graph source kind: ${input.kind}`);
}

/** Normalizes a non-empty, ordered multi-source binding. */
export function normalizeGraphSources(input) {
	if (!Array.isArray(input) || input.length === 0) {
		throw new TypeError("Graph sources must be a non-empty array.");
	}
	return Object.freeze(input.map(normalizeGraphSource));
}

/** Returns whether a canonical runtime value satisfies a declared port type. */
export function valueMatchesGraphType(value, type) {
	if (type === "any" || !BUILTIN_TYPES.includes(type)) {
		return true;
	}
	if (type === "null") {
		return value === null;
	}
	if (type === "boolean" || type === "string") {
		return typeof value === type;
	}
	if (type === "number") {
		return typeof value === "number" || value?.type === "number";
	}
	if (type === "bigint") {
		return value?.type === "bigint";
	}
	if (type === "array") {
		return value?.type === "array";
	}
	if (type === "object") {
		return value?.type === "object";
	}
	return ["array-buffer", "data-view", "typed-array"].includes(value?.type);
}

export { BUILTIN_TYPES as GRAPH_BUILTIN_TYPES };
