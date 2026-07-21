// B"H

import { FORBIDDEN_KEYS } from "./jsonData.js";

/** Validates and freezes a renderer-neutral data path. */
export function normalizeDataPath(path) {
	if (!Array.isArray(path)) throw new TypeError("Patch path must be an array.");
	const result = path.map(segment => {
		if (Number.isInteger(segment) && segment >= 0) return segment;
		if (typeof segment === "string" && segment && !FORBIDDEN_KEYS.has(segment)) return segment;
		throw new TypeError("Patch path segments must be safe strings or non-negative integers.");
	});
	return Object.freeze(result);
}

/** Resolves a path and reports whether the final value exists. */
export function readDataPath(document, path) {
	let value = document;
	for (const segment of path) {
		if (value == null || typeof value !== "object" || !Object.hasOwn(value, segment)) {
			return Object.freeze({ exists: false, value: undefined });
		}
		value = value[segment];
	}
	return Object.freeze({ exists: true, value });
}

/** Resolves the mutable parent container for a non-root patch path. */
export function resolveDataParent(document, path) {
	if (path.length === 0) throw new RangeError("Root paths have no parent.");
	let parent = document;
	for (const segment of path.slice(0, -1)) {
		if (parent == null || typeof parent !== "object" || !Object.hasOwn(parent, segment)) {
			throw new RangeError("Patch parent path does not exist.");
		}
		parent = parent[segment];
	}
	if (parent == null || typeof parent !== "object") {
		throw new TypeError("Patch parent must be an object or array.");
	}
	return Object.freeze({ parent, key: path.at(-1) });
}
