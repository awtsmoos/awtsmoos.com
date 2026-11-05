// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectDiff.js
 * @description Generates deterministic bounded add, remove, and replace operations between projects.
 * The Awtsmoos renews difference and sameness within one source; Awtsmoos.com walks
 * sorted plain objects and treats changed arrays as one vessel so patches stay stable and clear.
 */

import {
	canonicalMovieValue,
	stringifyCanonicalMovieJson
} from './MovieCanonicalJson.js';
import { encodeMovieJsonPointer } from './MovieJsonPointer.js';

export function diffMovieProjects(before, after) {
	const left = canonicalMovieValue(before);
	const right = canonicalMovieValue(after);
	const patch = [];
	walkDiff(left, right, [], patch);
	return canonicalMovieValue(patch);
}

function walkDiff(before, after, segments, patch) {
	if (same(before, after)) return;
	if (isPlainObject(before) && isPlainObject(after)) {
		diffObjects(before, after, segments, patch);
		return;
	}
	patch.push({
		op: 'replace',
		path: encodeMovieJsonPointer(segments),
		value: after
	});
}

function diffObjects(before, after, segments, patch) {
	const beforeKeys = Object.keys(before).sort();
	const afterKeys = Object.keys(after).sort();
	for (const key of beforeKeys.filter(key => !Object.hasOwn(after, key)).reverse()) {
		patch.push({
			op: 'remove',
			path: encodeMovieJsonPointer([...segments, key])
		});
	}
	for (const key of afterKeys) {
		const path = [...segments, key];
		if (!Object.hasOwn(before, key)) {
			patch.push({
				op: 'add',
				path: encodeMovieJsonPointer(path),
				value: after[key]
			});
			continue;
		}
		walkDiff(before[key], after[key], path, patch);
	}
}

function same(left, right) {
	return stringifyCanonicalMovieJson(left) === stringifyCanonicalMovieJson(right);
}

function isPlainObject(value) {
	return Boolean(
		value
		&& typeof value === 'object'
		&& !Array.isArray(value)
		&& Object.getPrototypeOf(value) === Object.prototype
	);
}
