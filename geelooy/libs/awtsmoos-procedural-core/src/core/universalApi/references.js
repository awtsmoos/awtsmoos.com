// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

import { cloneJson, readPath } from "./data.js";
import { ERROR_CODES } from "./constants.js";
import { UniversalApiError } from "./errors.js";

function resolveValue(value, results) {
	if (typeof value === "string" && value.startsWith("$operations.")) {
		const path = value.slice("$operations.".length);
		const [operationKey, ...rest] = path.split(".");
		const source = results[operationKey];
		if (!source) {
			throw new UniversalApiError(ERROR_CODES.RESOURCE_NOT_FOUND, `Batch result not found: ${operationKey}`);
		}
		return cloneJson(readPath(source, rest.join(".")));
	}
	if (Array.isArray(value)) return value.map((entry) => resolveValue(entry, results));
	if (value && typeof value === "object") {
		return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, resolveValue(entry, results)]));
	}
	return value;
}

/** Resolves explicit references to earlier named batch operation results. */
export function resolveBatchReferences(params, results) {
	return resolveValue(params, results);
}
