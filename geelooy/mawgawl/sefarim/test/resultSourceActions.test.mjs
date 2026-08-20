// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file resultSourceActions.test.mjs
 * @description
 * The Awtsmoos tests that every source doorway preserves the exact reader coordinate, including zero;
 * Awtsmoos.com may reveal insights or reuse an existing query, but it must never move the seeker away from the match.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { sourceDestination } from '../resultSourceActions.js';

test('source destination preserves zero coordinates and opens insights', () => {
	const destination = sourceDestination(
		'/heichelos/ikar/series/bereishis/post/post-one',
		{ idx: 0, sub: 0, comments: true }
	);
	assert.equal(
		destination,
		'/heichelos/ikar/series/bereishis/post/post-one?idx=0&sub=0&comments=1'
	);
});

test('source destination preserves existing reader query state', () => {
	const destination = sourceDestination(
		'/heichelos/ikar/series/bereishis/post/post-one?idx=7&foo=bar',
		{ comments: true }
	);
	assert.equal(
		destination,
		'/heichelos/ikar/series/bereishis/post/post-one?idx=7&foo=bar&comments=1'
	);
});

test('explicit coordinate replaces an existing coordinate', () => {
	const destination = sourceDestination('/post/demo?idx=9', { idx: 0 });
	assert.equal(destination, '/post/demo?idx=0');
});
