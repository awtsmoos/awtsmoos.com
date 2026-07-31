// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCanonicalJsonWalker.js
 * @description Traverses large bounded plain JSON vessels in deterministic key order.
 * The Awtsmoos is beyond depth, node, and prototype; Awtsmoos.com guards each finite path
 * so no cycle, accessor, executable value, or polluted key can hide inside a movie document.
 */

import { MovieApiError } from './MovieApiError.js';

export const MOVIE_CANONICAL_JSON_MAX_DEPTH = 64;
export const MOVIE_CANONICAL_JSON_MAX_NODES = 2000000;

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const DEFAULT_LIMITS = Object.freeze({
	maxDepth: MOVIE_CANONICAL_JSON_MAX_DEPTH,
	maxNodes: MOVIE_CANONICAL_JSON_MAX_NODES
});

export function walkCanonicalMovieValue(value, options = {}) {
	return visit(value, '$', 0, {
		limits: { ...DEFAULT_LIMITS, ...options },
		nodes: 0,
		stack: new WeakSet()
	});
}

function visit(value, path, depth, context) {
	context.nodes += 1;
	if (context.nodes > context.limits.maxNodes) {
		throw invalid('MOVIE_JSON_NODE_LIMIT', 'Movie JSON contains too many values.', path);
	}
	if (depth > context.limits.maxDepth) {
		throw invalid('MOVIE_JSON_DEPTH_LIMIT', 'Movie JSON is nested too deeply.', path);
	}
	if (value === null || typeof value === 'string' || typeof value === 'boolean') {
		return value;
	}
	if (typeof value === 'number') return finiteNumber(value, path);
	if (typeof value !== 'object') {
		throw invalid(
			'MOVIE_JSON_UNSUPPORTED_TYPE',
			`Movie JSON cannot contain ${typeof value}.`,
			path
		);
	}
	return visitObject(value, path, depth, context);
}

function finiteNumber(value, path) {
	if (!Number.isFinite(value)) {
		throw invalid('MOVIE_JSON_NON_FINITE', 'Movie JSON numbers must be finite.', path);
	}
	return Object.is(value, -0) ? 0 : value;
}

function visitObject(value, path, depth, context) {
	if (context.stack.has(value)) {
		throw invalid('MOVIE_JSON_CYCLE', 'Movie JSON cannot contain cycles.', path);
	}
	context.stack.add(value);
	try {
		if (Array.isArray(value)) {
			return value.map((item, index) => visit(
				item,
				`${path}[${index}]`,
				depth + 1,
				context
			));
		}
		const prototype = Object.getPrototypeOf(value);
		if (prototype !== Object.prototype && prototype !== null) {
			throw invalid(
				'MOVIE_JSON_UNSAFE_PROTOTYPE',
				'Movie JSON objects must use a plain or null prototype.',
				path
			);
		}
		return visitPlainObject(value, path, depth, context);
	} finally {
		context.stack.delete(value);
	}
}

function visitPlainObject(value, path, depth, context) {
	const descriptors = Object.getOwnPropertyDescriptors(value);
	const result = {};
	for (const key of Object.keys(descriptors).sort()) {
		if (DANGEROUS_KEYS.has(key)) {
			throw invalid('MOVIE_JSON_DANGEROUS_KEY', `Unsafe key ${key} is forbidden.`, path);
		}
		const descriptor = descriptors[key];
		if (!('value' in descriptor)) {
			throw invalid(
				'MOVIE_JSON_ACCESSOR',
				'Movie JSON cannot contain accessors.',
				`${path}.${key}`
			);
		}
		result[key] = visit(descriptor.value, `${path}.${key}`, depth + 1, context);
	}
	return result;
}

function invalid(code, message, path) {
	return new MovieApiError(code, message, { path });
}
