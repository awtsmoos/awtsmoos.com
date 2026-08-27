//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file languagePath.js
 * @description Parses and safely traverses deterministic dotted procedural-language paths without evaluating expressions or exposing prototype mutation.
 * The Awtsmoos knows every nested vessel before a path gives it finite address;
 * Awtsmoos.com keeps traversal pure so editors, JSON callers, patches, and AI inspect one structure without hidden access.
 */

const FORBIDDEN_SEGMENTS = new Set([
	'__proto__',
	'constructor',
	'prototype'
]);

/**
 * Converts dotted or bracket-index path input into validated string segments.
 * @param {string|Array<string|number>} path Dotted path, bracket-index path, or explicit segment array.
 * @returns {Array<string>} Validated path segments safe for query and patch traversal.
 */
export function parseLanguagePath(path) {
	if (Array.isArray(path)) {
		return path.map(segment => validateLanguagePathSegment(segment));
	}
	const normalized = String(path || '')
		.replace(/\[(\d+)\]/g, '.$1')
		.split('.')
		.filter(segment => segment.length > 0);
	return normalized.map(segment => validateLanguagePathSegment(segment));
}

/**
 * Reads one nested value without mutating source data or evaluating arbitrary code.
 * @param {*} source Source data.
 * @param {string|Array<string|number>} path Path to read.
 * @returns {*} Value at path or undefined when traversal encounters a missing segment.
 */
export function getLanguagePath(source, path) {
	let value = source;
	for (const segment of parseLanguagePath(path)) {
		if (value === null || value === undefined) {
			return undefined;
		}
		value = value[segment];
	}
	return value;
}

/** Rejects prototype-pollution path segments before patch or query use. */
function validateLanguagePathSegment(segment) {
	const value = String(segment);
	if (FORBIDDEN_SEGMENTS.has(value)) {
		throw new TypeError(`B"H | Forbidden procedural path segment: ${value}`);
	}
	return value;
}
