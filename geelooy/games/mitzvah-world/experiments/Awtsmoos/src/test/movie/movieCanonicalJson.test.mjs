// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieCanonicalJson.test.mjs
 * @description Proves deterministic Unicode-safe JSON and rejection of executable or unsafe vessels.
 * The Awtsmoos is beyond key order and hidden behavior; Awtsmoos.com verifies that
 * every accepted value is plain, finite, bounded, deterministic, and machine-portable.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	canonicalMovieValue,
	movieJsonChecksum,
	parseCanonicalMovieJson,
	stringifyCanonicalMovieJson
} from '../../movie/MovieCanonicalJson.js';

test('canonical JSON sorts keys recursively and preserves Unicode', () => {
	const left = { z: 1, a: { שלום: 'ברוך', b: 2, a: 1 } };
	const right = { a: { a: 1, b: 2, שלום: 'ברוך' }, z: 1 };
	assert.equal(
		stringifyCanonicalMovieJson(left),
		stringifyCanonicalMovieJson(right)
	);
	assert.deepEqual(parseCanonicalMovieJson(
		stringifyCanonicalMovieJson(left)
	), canonicalMovieValue(right));
});

test('checksum is deterministic and changes with content', () => {
	const first = stringifyCanonicalMovieJson({ a: 1, b: 2 });
	const reordered = stringifyCanonicalMovieJson({ b: 2, a: 1 });
	assert.equal(movieJsonChecksum(first), movieJsonChecksum(reordered));
	assert.notEqual(movieJsonChecksum(first), movieJsonChecksum('{"a":2}'));
});

test('canonical JSON rejects cycles and unsupported primitives', () => {
	const cycle = {};
	cycle.self = cycle;
	assert.throws(() => canonicalMovieValue(cycle), error => (
		error.code === 'MOVIE_JSON_CYCLE'
	));
	for (const value of [undefined, () => null, Symbol('x'), 1n]) {
		assert.throws(() => canonicalMovieValue(value), error => (
			error.code === 'MOVIE_JSON_UNSUPPORTED_TYPE'
		));
	}
});

test('canonical JSON rejects non-finite numbers and unsafe prototypes', () => {
	for (const value of [NaN, Infinity, -Infinity]) {
		assert.throws(() => canonicalMovieValue(value), error => (
			error.code === 'MOVIE_JSON_NON_FINITE'
		));
	}
	assert.throws(() => canonicalMovieValue(new Date()), error => (
		error.code === 'MOVIE_JSON_UNSAFE_PROTOTYPE'
	));
});

test('canonical JSON rejects accessors and dangerous keys', () => {
	const accessor = {};
	Object.defineProperty(accessor, 'value', { enumerable: true, get: () => 1 });
	assert.throws(() => canonicalMovieValue(accessor), error => (
		error.code === 'MOVIE_JSON_ACCESSOR'
	));
	const dangerous = Object.create(null);
	Object.defineProperty(dangerous, '__proto__', {
		enumerable: true,
		value: { polluted: true }
	});
	assert.throws(() => canonicalMovieValue(dangerous), error => (
		error.code === 'MOVIE_JSON_DANGEROUS_KEY'
	));
});

test('canonical JSON enforces depth and node limits', () => {
	assert.throws(
		() => canonicalMovieValue({ a: { b: 1 } }, { maxDepth: 1 }),
		error => error.code === 'MOVIE_JSON_DEPTH_LIMIT'
	);
	assert.throws(
		() => canonicalMovieValue([1, 2, 3], { maxNodes: 2 }),
		error => error.code === 'MOVIE_JSON_NODE_LIMIT'
	);
});
