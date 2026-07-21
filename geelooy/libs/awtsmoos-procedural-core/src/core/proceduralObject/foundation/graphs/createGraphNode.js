// B"H

import { normalizeCanonicalValue } from "../canonical/index.js";
import { createOperationDefinition } from "../operations/index.js";
import { assertGraphName, normalizeGraphSource, normalizeGraphType } from "./graphContract.js";

function normalizeInputBinding(input, portName) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError(`Graph input binding must be an object: ${portName}`);
	}
	const type = normalizeGraphType(input.type, `Input type for ${portName}`);
	const hasValue = Object.hasOwn(input, "value");
	const hasSource = Object.hasOwn(input, "source");
	if (hasValue === hasSource) {
		throw new TypeError(`Input ${portName} requires exactly one value or source.`);
	}
	return Object.freeze({
		type,
		...(hasValue
			? { value: normalizeCanonicalValue(input.value) }
			: { source: normalizeGraphSource(input.source) })
	});
}

function normalizeInputs(inputs) {
	if (!inputs || typeof inputs !== "object" || Array.isArray(inputs)) {
		throw new TypeError("Graph node inputs must be an object.");
	}
	return Object.freeze(Object.fromEntries(Object.keys(inputs).sort().map(name => [
		assertGraphName(name, "Input port name"),
		normalizeInputBinding(inputs[name], name)
	])));
}

function normalizeOutputs(outputs) {
	if (!outputs || typeof outputs !== "object" || Array.isArray(outputs)) {
		throw new TypeError("Graph node outputs must be an object.");
	}
	return Object.freeze(Object.fromEntries(Object.keys(outputs).sort().map(name => [
		assertGraphName(name, "Output port name"),
		normalizeGraphType(outputs[name], `Output type for ${name}`)
	])));
}

/**
 * Creates one executable-free typed graph node. The Awtsmoos reveals the tool
 * only by name and version; the trusted living executor remains outside the data.
 */
export function createGraphNode(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Graph node input must be an object.");
	}
	const operation = createOperationDefinition({
		name: input.operation?.name,
		version: input.operation?.version
	});
	return Object.freeze({
		id: assertGraphName(input.id, "Graph node id"),
		operation: Object.freeze({ name: operation.name, version: operation.version }),
		inputs: normalizeInputs(input.inputs ?? {}),
		outputs: normalizeOutputs(input.outputs ?? {}),
		config: normalizeCanonicalValue(input.config ?? {}),
		seed: input.seed == null ? null : normalizeCanonicalValue(input.seed)
	});
}
