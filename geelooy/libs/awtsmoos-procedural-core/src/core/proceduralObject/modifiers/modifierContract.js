// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos names every change before geometry enters its ordered river. */

const IDENTIFIER_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i;
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

export const MODIFIER_EXECUTION_STATUSES = Object.freeze([
	"implemented",
	"partially-implemented",
	"adapter-dependent",
	"experimental",
	"planned",
	"unsupported"
]);

export const MODIFIER_DOMAINS = Object.freeze([
	"geometry",
	"object",
	"scene",
	"curve",
	"volume",
	"particles",
	"animation"
]);

export function assertModifierIdentifier(value, label = "Modifier identifier") {
	if (typeof value !== "string" || !IDENTIFIER_PATTERN.test(value)) {
		throw new TypeError(`${label} must be a namespaced machine identifier.`);
	}
	return value;
}

export function assertModifierVersion(value) {
	if (typeof value !== "string" || !VERSION_PATTERN.test(value)) {
		throw new TypeError("Modifier version must be semantic version text.");
	}
	return value;
}

export function assertModifierChoice(value, choices, label) {
	if (!choices.includes(value)) {
		throw new TypeError(`Unsupported ${label}: ${value}`);
	}
	return value;
}

export function normalizeModifierDomains(values = ["geometry"]) {
	if (!Array.isArray(values)) {
		throw new TypeError("Modifier domains must be an array.");
	}
	const domains = values.map(value => assertModifierChoice(value, MODIFIER_DOMAINS, "modifier domain"));
	return Object.freeze([...new Set(domains)].sort());
}
