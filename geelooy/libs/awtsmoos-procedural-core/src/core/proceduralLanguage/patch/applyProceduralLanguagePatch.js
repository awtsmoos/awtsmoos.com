//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file applyProceduralLanguagePatch.js
 * @description Applies portable immutable set, merge, append, and remove patches to universal definition JSON through prototype-safe paths.
 * The Awtsmoos renews change without losing identity; Awtsmoos.com records mutation as replayable data so editors, networks, agents, layers, and transactions share the same light.
 */

import { cloneLanguageValue } from '../data/freezeLanguageValue.js';
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';
import { parseLanguagePath } from '../query/languagePath.js';

/**
 * Applies ordered patch operations and returns a new canonical definition without mutating source data.
 * @param {object|string} input Base definition data, JSON text, or fluent wrapper.
 * @param {Array<object>} [patches=[]] Ordered set, merge, append, or remove patch records.
 * @returns {Readonly<object>} Canonical immutable patched definition.
 */
export function applyProceduralLanguagePatch(input, patches = []) {
	const draft = cloneLanguageValue(createProceduralDefinition(input));
	for (const patch of patches) {
		applyOnePatch(draft, patch);
	}
	return createProceduralDefinition(draft);
}

/** Applies one validated patch to a private mutable draft. */
function applyOnePatch(root, patch = {}) {
	const segments = parseLanguagePath(patch.path);
	if (!segments.length) {
		throw new TypeError('B"H | Procedural patch requires a non-root path.');
	}
	const parent = walkLanguagePatchParent(root, segments);
	const key = segments.at(-1);
	switch (patch.op) {
		case 'set':
			parent[key] = cloneLanguageValue(patch.value);
			break;
		case 'merge':
			parent[key] = {
				...(parent[key] || {}),
				...cloneLanguageValue(patch.value || {})
			};
			break;
		case 'append':
			parent[key] = [
				...(parent[key] || []),
				cloneLanguageValue(patch.value)
			];
			break;
		case 'remove':
			removeLanguagePatchValue(parent, key);
			break;
		default:
			throw new TypeError(`B"H | Unsupported procedural patch op: ${patch.op}`);
	}
}

/** Walks or creates object containers up to the final patch path segment. */
function walkLanguagePatchParent(root, segments) {
	let current = root;
	for (const segment of segments.slice(0, -1)) {
		if (!current[segment] || typeof current[segment] !== 'object') {
			current[segment] = {};
		}
		current = current[segment];
	}
	return current;
}

/** Removes one object property or array index without executing arbitrary expressions. */
function removeLanguagePatchValue(parent, key) {
	const index = Number(key);
	if (Array.isArray(parent) && Number.isInteger(index)) {
		parent.splice(index, 1);
		return;
	}
	delete parent[key];
}
