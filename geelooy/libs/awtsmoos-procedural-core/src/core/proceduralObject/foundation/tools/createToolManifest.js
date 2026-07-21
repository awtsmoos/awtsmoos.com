// B"H

import { hashCanonicalValue, normalizeCanonicalValue } from "../canonical/index.js";
import { normalizeResourceBudget } from "../budgets/index.js";
import { createOperationDefinition } from "../operations/index.js";

const ID_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i;
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

function normalizeNames(values, label) {
	if (!Array.isArray(values) || values.some(value => typeof value !== "string" || !ID_PATTERN.test(value))) {
		throw new TypeError(`${label} must contain machine identifiers.`);
	}
	return Object.freeze([...new Set(values)].sort());
}

function normalizeOperations(values) {
	if (!Array.isArray(values)) throw new TypeError("Tool operations must be an array.");
	const operations = new Map();
	for (const value of values) {
		const definition = createOperationDefinition({ name: value?.name, version: value?.version });
		const operation = Object.freeze({ name: definition.name, version: definition.version });
		operations.set(`${operation.name}@${operation.version}`, operation);
	}
	return Object.freeze([...operations.values()].sort((left, right) => {
		const leftKey = `${left.name}@${left.version}`;
		const rightKey = `${right.name}@${right.version}`;
		return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
	}));
}

/** Creates a hashed, executable-free manifest for one machine-addressable tool. */
export function createToolManifest(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Tool manifest input must be an object.");
	}
	if (typeof input.id !== "string" || !ID_PATTERN.test(input.id)) {
		throw new TypeError("Tool manifest id must be a machine identifier.");
	}
	if (typeof input.version !== "string" || !VERSION_PATTERN.test(input.version)) {
		throw new TypeError("Tool manifest version must be semantic version text.");
	}
	const content = Object.freeze({
		id: input.id,
		version: input.version,
		title: typeof input.title === "string" ? input.title.trim() : "",
		description: typeof input.description === "string" ? input.description.trim() : "",
		operations: normalizeOperations(input.operations ?? []),
		capabilities: normalizeNames(input.capabilities ?? [], "Tool capabilities"),
		permissions: normalizeNames(input.permissions ?? [], "Tool permissions"),
		resourceBudget: normalizeResourceBudget(input.resourceBudget ?? {}),
		inputSchema: normalizeCanonicalValue(input.inputSchema ?? {}),
		outputSchema: normalizeCanonicalValue(input.outputSchema ?? {}),
		metadata: normalizeCanonicalValue(input.metadata ?? {})
	});
	return Object.freeze({ ...content, manifestHash: hashCanonicalValue(content) });
}
