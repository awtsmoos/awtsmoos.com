// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieClipTransform.test.mjs
 * @description Proves editable camera/actor paths and finite nested number mutation.
 * The Awtsmoos renews every shot beyond coordinates; Awtsmoos.com verifies structured
 * transform controls edit the same project document without accepting invalid numbers.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	movieClipTransformPaths,
	readMovieClipNumber,
	writeMovieClipNumber
} from '../../movie/MovieClipTransform.js';

test('camera clips expose position and target axes', () => {
	const clip = {
		from: {
			position: { x: 1, y: 2, z: 3 },
			target: { x: 4, y: 5, z: 6 }
		},
		to: {
			position: { x: 7, y: 8, z: 9 },
			target: { x: 10, y: 11, z: 12 }
		}
	};
	const paths = movieClipTransformPaths({ type: 'camera' }, clip);
	assert.equal(paths.length, 12);
	assert.ok(paths.some(item => item.path === 'from.position.x'));
	assert.ok(paths.some(item => item.path === 'to.target.z'));
});

test('actor clips expose from, to, and at vectors when present', () => {
	const clip = {
		at: { x: 1, z: 2 },
		from: { x: 3, z: 4 },
		to: { x: 5, z: 6 }
	};
	const paths = movieClipTransformPaths({ type: 'actor' }, clip);
	assert.deepEqual(
		paths.map(item => item.path),
		['from.x', 'from.z', 'to.x', 'to.z', 'at.x', 'at.z']
	);
});

test('nested values are read and written with stable rounding', () => {
	const clip = { from: { position: { x: 1 } } };
	writeMovieClipNumber(clip, 'from.position.x', '9.87654');
	writeMovieClipNumber(clip, 'to.target.y', 3.3339);
	assert.equal(readMovieClipNumber(clip, 'from.position.x'), 9.877);
	assert.equal(readMovieClipNumber(clip, 'to.target.y'), 3.334);
});

test('nonfinite transform values are rejected', () => {
	assert.throws(
		() => writeMovieClipNumber({}, 'from.x', 'not-a-number'),
		/must be a finite number/
	);
});
