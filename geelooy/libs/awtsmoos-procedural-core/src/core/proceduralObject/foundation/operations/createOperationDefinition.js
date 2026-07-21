// B"H

import { normalizeCanonicalValue } from "../canonical/index.js";
import { normalizeResourceUsage } from "../budgets/index.js";

const IDENTIFIER_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i;
const EXTENSION_PATTERN = /^ext:[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/i;
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const DETERMINISM_MODES = Object.freeze(["deterministic", "seeded", "external"]);

function assertName(value, label, allowExtension = false) {
	const valid = typeof value === "string"
		&& (IDENTIFIER_PATTERN.test(value) || (allowExtension && EXTENSION_PATTERN.test(value)));
	if (!valid) {
		throw new TypeError(`${label} must be a namespaced machine identifier.`);
	}
	return value;
}

function normalizeNames(values, label, allowExtension = false) {
	if (!Array.isArray(values)) {
		throw new TypeError(`${label} must be an array.`);
	}
	const names = values.map(value => assertName(value, label, allowExtension));
	return Object.freeze([...new Set(names)].sort());
}

/**
 * Seals the pure-data declaration resolved by a trusted operation registry.
 *
 * The definition carries no executable shadow: only version, capabilities,
 * schemas, permissions, cost, and the declared border of determinism.
 */
export function createOperationDefinition(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Operation definition must be an object.");
	}
	const name = assertName(input.name, "Operation name", true);
	if (typeof input.version !== "string" || !VERSION_PATTERN.test(input.version)) {
		throw new TypeError("Operation version must be semantic version text.");
	}
	const determinism = input.determinism ?? "deterministic";
	if (!DETERMINISM_MODES.includes(determinism)) {
		throw new TypeError(`Unsupported determinism mode: ${determinism}`);
	}
	const executor = assertName(input.executor ?? "core", "Operation executor");
	const replacement = input.replacement == null
		? null
		: assertName(input.replacement, "Operation replacement", true);
	return Object.freeze({
		name,
		version: input.version,
		description: typeof input.description === "string" ? input.description.trim() : "",
		determinism,
		executor,
		inputCapabilities: normalizeNames(input.inputCapabilities ?? [], "Input capabilities"),
		outputCapabilities: normalizeNames(input.outputCapabilities ?? [], "Output capabilities"),
		permissions: normalizeNames(input.permissions ?? [], "Operation permissions"),
		resourceCost: normalizeResourceUsage(input.resourceCost ?? {}),
		inputSchema: normalizeCanonicalValue(input.inputSchema ?? {}),
		outputSchema: normalizeCanonicalValue(input.outputSchema ?? {}),
		deprecated: input.deprecated === true,
		replacement,
		metadata: normalizeCanonicalValue(input.metadata ?? {})
	});
}

export { DETERMINISM_MODES as OPERATION_DETERMINISM_MODES };
