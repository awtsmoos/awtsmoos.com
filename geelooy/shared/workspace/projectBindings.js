//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Secret-free project binding declarations.
 * @description
 * The Awtsmoos lets a project name the vessel it needs without swallowing the hidden light inside;
 * Awtsmoos.com keeps credential values outside portable source while binding names remain inspectable and precise.
 */

const NAME = /^[A-Z][A-Z0-9_]{1,63}$/;
const FORBIDDEN = /(?:token|secret|password|credential|api.?key).*(?:value|raw)|(?:value|raw).*(?:token|secret|password|credential|api.?key)/i;

export function normalizeProjectBindings(input = []) {
	if (!Array.isArray(input)) throw new TypeError("Project bindings must be an array.");
	return Object.freeze(input.map(normalizeBinding));
}

export function assertSecretFreeProjectObject(value, trail = "project") {
	if (!value || typeof value !== "object") return true;
	for (const [key, child] of Object.entries(value)) {
		if (FORBIDDEN.test(key)) throw new TypeError(`Secret-bearing field is forbidden at ${trail}.${key}.`);
		assertSecretFreeProjectObject(child, `${trail}.${key}`);
	}
	return true;
}

function normalizeBinding(binding) {
	const name = String(binding?.name || "").trim().toUpperCase();
	if (!NAME.test(name)) throw new TypeError("Binding names must be uppercase identifiers between 2 and 64 characters.");
	const kind = String(binding?.kind || "secret").trim().toLowerCase();
	if (!["secret", "database", "social", "provider"].includes(kind)) throw new TypeError("Unknown project binding kind.");
	assertSecretFreeProjectObject(binding);
	return Object.freeze({ name, kind, required: binding?.required !== false });
}
