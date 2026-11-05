// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectPatchOperation.js
 * @description Applies one validated add, remove, or replace operation and returns its inverse.
 * The Awtsmoos renews whole document beyond one changed path; Awtsmoos.com keeps
 * array, object, root, missing-path, and inverse mechanics separate from public patch validation.
 */

import { canonicalMovieValue } from './MovieCanonicalJson.js';
import { MovieApiError } from './MovieApiError.js';
import {
	encodeMovieJsonPointer,
	movieJsonPointerParent,
	parseMovieJsonPointer
} from './MovieJsonPointer.js';

export function applyMovieProjectPatchOperation(project, operation) {
	if (operation.path === '') return applyRoot(project, operation);
	const { key, parent } = movieJsonPointerParent(project, operation.path);
	if (!parent || typeof parent !== 'object') return missing(operation.path);
	return Array.isArray(parent)
		? applyArray(project, parent, key, operation)
		: applyObject(project, parent, key, operation);
}

function applyRoot(project, operation) {
	if (operation.op === 'remove') {
		throw new MovieApiError(
			'MOVIE_PATCH_CANNOT_REMOVE_ROOT',
			'Movie patch cannot remove the project root.'
		);
	}
	return {
		inverse: { op: 'replace', path: '', value: project },
		project: canonicalMovieValue(operation.value)
	};
}

function applyObject(project, parent, key, operation) {
	const exists = Object.hasOwn(parent, key);
	if (operation.op !== 'add' && !exists) return missing(operation.path);
	const oldValue = exists ? canonicalMovieValue(parent[key]) : undefined;
	if (operation.op === 'remove') delete parent[key];
	else parent[key] = canonicalMovieValue(operation.value);
	return {
		inverse: inverseFor(operation, oldValue, exists, operation.path),
		project
	};
}

function applyArray(project, parent, key, operation) {
	const index = arrayIndex(parent, key, operation.op === 'add');
	const exists = index < parent.length;
	if (operation.op !== 'add' && !exists) return missing(operation.path);
	const oldValue = exists ? canonicalMovieValue(parent[index]) : undefined;
	if (operation.op === 'add') {
		parent.splice(index, 0, canonicalMovieValue(operation.value));
	}
	if (operation.op === 'remove') parent.splice(index, 1);
	if (operation.op === 'replace') {
		parent[index] = canonicalMovieValue(operation.value);
	}
	const actualPath = encodeMovieJsonPointer([
		...parseMovieJsonPointer(operation.path).slice(0, -1),
		String(index)
	]);
	return {
		inverse: inverseFor(operation, oldValue, exists, actualPath),
		project
	};
}

function inverseFor(operation, oldValue, existed, path) {
	if (operation.op === 'remove') return { op: 'add', path, value: oldValue };
	if (operation.op === 'replace' || existed) {
		return { op: 'replace', path, value: oldValue };
	}
	return { op: 'remove', path };
}

function arrayIndex(parent, key, allowEnd) {
	if (key === '-' && allowEnd) return parent.length;
	if (!/^(0|[1-9]\d*)$/.test(key)) return invalidIndex(key);
	const index = Number(key);
	if (!Number.isSafeInteger(index)
		|| index > parent.length
		|| (!allowEnd && index === parent.length)) {
		return invalidIndex(key);
	}
	return index;
}

function missing(path) {
	throw new MovieApiError(
		'MOVIE_PATCH_PATH_NOT_FOUND',
		`Movie patch path ${path} does not exist.`,
		{ path }
	);
}

function invalidIndex(key) {
	throw new MovieApiError(
		'INVALID_MOVIE_PATCH_ARRAY_INDEX',
		`Invalid movie patch array index ${key}.`,
		{ key }
	);
}
