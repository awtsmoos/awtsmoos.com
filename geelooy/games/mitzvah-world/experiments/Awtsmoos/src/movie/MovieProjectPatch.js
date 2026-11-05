// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectPatch.js
 * @description Validates bounded patch arrays and applies them atomically with inversion.
 * The Awtsmoos renews whole document beyond every apparent fragment; Awtsmoos.com
 * validates the entire command vessel before one cloned project may change.
 */

import { canonicalMovieValue } from './MovieCanonicalJson.js';
import { MovieApiError } from './MovieApiError.js';
import { parseMovieJsonPointer } from './MovieJsonPointer.js';
import { applyMovieProjectPatchOperation } from './MovieProjectPatchOperation.js';

const OPERATIONS = new Set(['add', 'remove', 'replace']);

export function applyMovieProjectPatch(source, patch) {
	return applyMovieProjectPatchWithInverse(source, patch).project;
}

export function invertMovieProjectPatch(source, patch) {
	return applyMovieProjectPatchWithInverse(source, patch).inverse;
}

export function applyMovieProjectPatchWithInverse(source, patch) {
	const operations = normalizeMovieProjectPatch(patch);
	let project = canonicalMovieValue(source);
	const inverse = [];
	for (const operation of operations) {
		const result = applyMovieProjectPatchOperation(project, operation);
		project = result.project;
		inverse.unshift(result.inverse);
	}
	return {
		inverse: canonicalMovieValue(inverse),
		project: canonicalMovieValue(project)
	};
}

export function normalizeMovieProjectPatch(source) {
	const patch = canonicalMovieValue(source);
	if (!Array.isArray(patch) || patch.length > 1024) {
		throw new MovieApiError(
			'INVALID_MOVIE_PATCH',
			'Movie patch must be an array containing at most 1024 operations.'
		);
	}
	return patch.map((operation, index) => normalizeOperation(operation, index));
}

function normalizeOperation(operation, index) {
	if (!OPERATIONS.has(operation?.op)) {
		throw new MovieApiError(
			'UNSUPPORTED_MOVIE_PATCH_OPERATION',
			`Unsupported movie patch operation ${operation?.op || '(empty)'}.`,
			{ index }
		);
	}
	parseMovieJsonPointer(operation.path);
	if (operation.op !== 'remove' && !Object.hasOwn(operation, 'value')) {
		throw new MovieApiError(
			'MOVIE_PATCH_VALUE_REQUIRED',
			`Movie patch ${operation.op} requires a value.`,
			{ index }
		);
	}
	return operation;
}
