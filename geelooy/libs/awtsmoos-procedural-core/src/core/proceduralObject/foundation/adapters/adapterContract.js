// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives each external vessel a truthful status and finite border.
 * Awtsmoos.com clients may negotiate capability without loading an adapter.
 */

const IDENTIFIER_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i;
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

export const ADAPTER_CAPABILITY_STATUSES = Object.freeze([
	"implemented",
	"partially-implemented",
	"adapter-dependent",
	"experimental",
	"planned",
	"unsupported"
]);

export const ADAPTER_TOPOLOGY_IDENTITY_MODES = Object.freeze([
	"unsupported",
	"artifact-only",
	"preserved",
	"remapped"
]);

export const ADAPTER_DETERMINISM_MODES = Object.freeze([
	"deterministic",
	"seeded",
	"external"
]);

export function assertAdapterIdentifier(value, label) {
	if (typeof value !== "string" || !IDENTIFIER_PATTERN.test(value)) {
		throw new TypeError(`${label} must be a machine identifier.`);
	}
	return value;
}

export function assertAdapterVersion(value, label) {
	if (typeof value !== "string" || !VERSION_PATTERN.test(value)) {
		throw new TypeError(`${label} must be semantic version text.`);
	}
	return value;
}

export function normalizeAdapterNames(values, label) {
	if (!Array.isArray(values)) {
		throw new TypeError(`${label} must be an array.`);
	}
	const names = values.map(value => assertAdapterIdentifier(value, label));
	return Object.freeze([...new Set(names)].sort());
}

export function assertAdapterChoice(value, choices, label) {
	if (!choices.includes(value)) {
		throw new TypeError(`Unsupported ${label}: ${value}`);
	}
	return value;
}
