//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file diffProceduralDefinitions.js
 * @description Computes deterministic JSON-path semantic differences between canonical procedural definitions rather than fragile text-line differences.
 * The Awtsmoos knows both states in one instant while Awtsmoos.com names their finite delta;
 * this path-level witness helps debugging, caching, provenance, review, collaboration, and future migration data.
 */

import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';

/**
 * Returns immutable add, remove, and change records in deterministic traversal order.
 * @param {object|string} first First definition.
 * @param {object|string} second Second definition.
 * @returns {Readonly<Array<object>>} Semantic JSON-path differences.
 */
export function diffProceduralDefinitions(first, second) {
	const changes = [];
	walkProceduralDifference(
		createProceduralDefinition(first),
		createProceduralDefinition(second),
		'$',
		changes
	);
	return Object.freeze(changes.map(change => Object.freeze(change)));
}

/** Recursively compares arrays, objects, and primitive values. */
function walkProceduralDifference(first, second, path, changes) {
	if (Object.is(first, second)) {
		return;
	}
	if (Array.isArray(first) && Array.isArray(second)) {
		const length = Math.max(first.length, second.length);
		for (let index = 0; index < length; index += 1) {
			compareProceduralChild(first, second, index, `${path}[${index}]`, changes);
		}
		return;
	}
	if (isPlainProceduralObject(first) && isPlainProceduralObject(second)) {
		const keys = [...new Set([
			...Object.keys(first),
			...Object.keys(second)
		])].sort();
		for (const key of keys) {
			compareProceduralChild(first, second, key, `${path}.${key}`, changes);
		}
		return;
	}
	changes.push({
		path,
		kind: 'change',
		before: first,
		after: second
	});
}

/** Compares one property or array index while preserving add/remove semantics. */
function compareProceduralChild(first, second, key, path, changes) {
	if (!(key in first)) {
		changes.push({ path, kind: 'add', after: second[key] });
		return;
	}
	if (!(key in second)) {
		changes.push({ path, kind: 'remove', before: first[key] });
		return;
	}
	walkProceduralDifference(first[key], second[key], path, changes);
}

/** Returns true only for non-array object records participating in recursive semantic comparison. */
function isPlainProceduralObject(value) {
	return Boolean(value)
		&& typeof value === 'object'
		&& !Array.isArray(value);
}
