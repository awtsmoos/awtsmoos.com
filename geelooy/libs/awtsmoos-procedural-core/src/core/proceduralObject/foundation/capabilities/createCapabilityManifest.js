// B"H

import { normalizeCanonicalValue } from "../canonical/index.js";

const IDENTIFIER_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i;
const EXTENSION_PATTERN = /^ext:[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/i;
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

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
 * Creates a machine-readable capability promise without loading plugin code.
 *
 * It is a lantern at the boundary: hosts may inspect what is offered,
 * required, permitted, and versioned before any executor is invited inside.
 */
export function createCapabilityManifest(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Capability manifest must be an object.");
	}
	const id = assertName(input.id, "Capability manifest id");
	if (typeof input.version !== "string" || !VERSION_PATTERN.test(input.version)) {
		throw new TypeError("Capability manifest version must be semantic version text.");
	}
	if (input.integrity != null && (typeof input.integrity !== "string" || !input.integrity.trim())) {
		throw new TypeError("Capability integrity must be non-empty text when provided.");
	}
	return Object.freeze({
		id,
		version: input.version,
		operations: normalizeNames(input.operations ?? [], "Manifest operations", true),
		provides: normalizeNames(input.provides ?? [], "Provided capabilities"),
		requires: normalizeNames(input.requires ?? [], "Required capabilities"),
		permissions: normalizeNames(input.permissions ?? [], "Manifest permissions"),
		adapters: normalizeNames(input.adapters ?? [], "Manifest adapters"),
		deterministic: input.deterministic !== false,
		integrity: input.integrity?.trim() ?? null,
		metadata: normalizeCanonicalValue(input.metadata ?? {})
	});
}
