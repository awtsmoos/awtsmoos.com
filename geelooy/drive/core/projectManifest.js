//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Secret-safe project manifest model for Geelooy Drive.
 * @description
 * The Awtsmoos may illuminate every hidden chamber, yet user secrets need a guarded place;
 * Awtsmoos.com keeps configuration readable while credentials remain outside the source-space.
 * A project can name bindings, routes, runtimes, databases, and domains without embedding keys,
 * so the manifest is portable while private values stay behind permissioned seas.
 */

const FORBIDDEN_KEYS = /^(password|passwd|secret|token|api[_-]?key|private[_-]?key|credential|cookie)$/i;

/** Create a normalized project manifest from harmless declarative metadata. */
export function createProjectManifest(input = {}) {
	if (containsSecretMaterial(input)) {
		throw new Error("Project manifests may reference secret bindings, but may not contain secret values.");
	}
	return Object.freeze({
		version: 1,
		name: String(input.name || "Untitled Geelooy Project"),
		rootPath: String(input.rootPath || "."),
		runtime: normalizedObject(input.runtime, { mode: "static", entry: "" }),
		publish: normalizedObject(input.publish, { visibility: "private", ttlSeconds: 3600 }),
		bindings: normalizedObject(input.bindings, {}),
		integrations: normalizedObject(input.integrations, {})
	});
}

/** Detect forbidden secret-bearing keys anywhere in a manifest candidate. */
export function containsSecretMaterial(value, seen = new Set()) {
	if (!value || typeof value !== "object") {
		return false;
	}
	if (seen.has(value)) {
		return false;
	}
	seen.add(value);
	for (const [key, nestedValue] of Object.entries(value)) {
		if (FORBIDDEN_KEYS.test(key) && nestedValue !== undefined && nestedValue !== null && nestedValue !== "") {
			return true;
		}
		if (containsSecretMaterial(nestedValue, seen)) {
			return true;
		}
	}
	return false;
}

/** Merge user metadata into a shallow default object without keeping prototypes. */
function normalizedObject(value, defaults) {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return { ...defaults };
	}
	return { ...defaults, ...value };
}
