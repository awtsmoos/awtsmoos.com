// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieJsonPointer.js
 * @description Parses and encodes safe RFC-6901-style paths for canonical movie documents.
 * The Awtsmoos is beyond path and segment; Awtsmoos.com refuses polluted names and
 * malformed escapes so patches can traverse plain finite vessels without touching prototypes.
 */

import { MovieApiError } from './MovieApiError.js';

const DANGEROUS = new Set(['__proto__', 'constructor', 'prototype']);

export function parseMovieJsonPointer(pointer) {
	const value = String(pointer ?? '');
	if (value === '') return [];
	if (!value.startsWith('/')) {
		throw pointerError('INVALID_MOVIE_JSON_POINTER', value);
	}
	return value.slice(1).split('/').map((segment, index) => {
		const decoded = decodeSegment(segment, value, index);
		if (DANGEROUS.has(decoded)) {
			throw new MovieApiError(
				'MOVIE_PATCH_DANGEROUS_PATH',
				`Movie patch path cannot contain ${decoded}.`,
				{ pointer: value, segment: decoded }
			);
		}
		return decoded;
	});
}

export function encodeMovieJsonPointer(segments) {
	if (!Array.isArray(segments)) {
		throw new MovieApiError(
			'INVALID_MOVIE_JSON_POINTER_SEGMENTS',
			'Movie JSON pointer segments must be an array.'
		);
	}
	if (!segments.length) return '';
	return `/${segments.map(segment => {
		const value = String(segment);
		if (DANGEROUS.has(value)) {
			throw new MovieApiError(
				'MOVIE_PATCH_DANGEROUS_PATH',
				`Movie patch path cannot contain ${value}.`
			);
		}
		return value.replace(/~/g, '~0').replace(/\//g, '~1');
	}).join('/')}`;
}

export function movieJsonPointerParent(document, pointer) {
	const segments = parseMovieJsonPointer(pointer);
	if (!segments.length) return { key: null, parent: null, segments };
	let parent = document;
	for (const segment of segments.slice(0, -1)) {
		if (!isContainer(parent) || !(segment in parent)) {
			throw new MovieApiError(
				'MOVIE_PATCH_PATH_NOT_FOUND',
				`Movie patch path ${pointer} does not exist.`,
				{ pointer }
			);
		}
		parent = parent[segment];
	}
	return {
		key: segments.at(-1),
		parent,
		segments
	};
}

function decodeSegment(segment, pointer, index) {
	if (/~(?:[^01]|$)/.test(segment)) {
		throw new MovieApiError(
			'INVALID_MOVIE_JSON_POINTER_ESCAPE',
			`Movie JSON pointer ${pointer} contains an invalid escape.`,
			{ index, pointer }
		);
	}
	return segment.replace(/~1/g, '/').replace(/~0/g, '~');
}

function isContainer(value) {
	return Boolean(value && typeof value === 'object');
}

function pointerError(code, pointer) {
	return new MovieApiError(
		code,
		'Movie JSON pointer must be empty or begin with /.',
		{ pointer }
	);
}
