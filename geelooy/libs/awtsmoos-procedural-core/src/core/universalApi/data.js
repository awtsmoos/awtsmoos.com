// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

/** Returns a JSON-safe structural clone without sharing mutable state. */
export function cloneJson(value) {
	if (value === undefined) return undefined;
	return JSON.parse(JSON.stringify(value));
}

/** Reads a dot-separated path from a JSON-compatible value. */
export function readPath(value, path) {
	return String(path).split(".").reduce((current, key) => current?.[key], value);
}

/** Assigns a dot-separated path while creating missing object vessels. */
export function writePath(target, path, value) {
	const parts = String(path).split(".");
	const last = parts.pop();
	const parent = parts.reduce((current, key) => {
		current[key] ??= {};
		return current[key];
	}, target);
	parent[last] = value;
	return target;
}

/** Creates a stable display-safe identifier from exact deterministic parts. */
export function stableId(prefix, ...parts) {
	const text = parts.map((part) => JSON.stringify(part)).join("|");
	let hash = 2166136261;
	for (const character of text) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return `${prefix}-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
