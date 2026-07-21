// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every boundary from nothing at every instant.
 * This Awtsmoos.com vessel names plugin authority before any host may act.
 */

const IDENTIFIER_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i;
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

export const PLUGIN_EXECUTION_MODES = Object.freeze([
	"declarative",
	"sandboxed",
	"trusted-host"
]);

export const PLUGIN_TRUST_LEVELS = Object.freeze([
	"untrusted",
	"verified",
	"trusted",
	"system"
]);

export function assertPluginIdentifier(value, label) {
	if (typeof value !== "string" || !IDENTIFIER_PATTERN.test(value)) {
		throw new TypeError(`${label} must be a machine identifier.`);
	}
	return value;
}

export function assertPluginVersion(value, label) {
	if (typeof value !== "string" || !VERSION_PATTERN.test(value)) {
		throw new TypeError(`${label} must be semantic version text.`);
	}
	return value;
}

export function normalizePluginIdentifiers(values, label) {
	if (!Array.isArray(values)) {
		throw new TypeError(`${label} must be an array.`);
	}
	const normalized = values.map(value => assertPluginIdentifier(value, label));
	return Object.freeze([...new Set(normalized)].sort());
}

export function assertPluginChoice(value, choices, label) {
	if (!choices.includes(value)) {
		throw new TypeError(`Unsupported ${label}: ${value}`);
	}
	return value;
}

export function normalizePluginSignature(input) {
	if (input == null) {
		return null;
	}
	if (typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Plugin signature must be an object.");
	}
	if (typeof input.value !== "string" || !input.value.trim()) {
		throw new TypeError("Plugin signature value must be non-empty text.");
	}
	return Object.freeze({
		algorithm: assertPluginIdentifier(input.algorithm, "Signature algorithm"),
		keyId: assertPluginIdentifier(input.keyId, "Signature key id"),
		value: input.value.trim()
	});
}
