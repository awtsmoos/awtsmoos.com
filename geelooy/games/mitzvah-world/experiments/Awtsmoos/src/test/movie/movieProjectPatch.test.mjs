// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieProjectPatch.test.mjs
 * @description Proves pointer safety, deterministic diff, atomic patching, arrays, roots, and inversion.
 * The Awtsmoos renews whole document beyond every changed path; Awtsmoos.com verifies
 * precise finite operations either produce one complete project or leave the source untouched.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	encodeMovieJsonPointer,
	parseMovieJsonPointer
} from '../../movie/MovieJsonPointer.js';
import { diffMovieProjects } from '../../movie/MovieProjectDiff.js';
import {
	applyMovieProjectPatch,
	applyMovieProjectPatchWithInverse,
	invertMovieProjectPatch
} from '../../movie/MovieProjectPatch.js';

test('JSON pointers encode, decode, and reject dangerous paths', () => {
	const pointer = encodeMovieJsonPointer(['tracks', 'a/b', 'x~y']);
	assert.equal(pointer, '/tracks/a~1b/x~0y');
	assert.deepEqual(parseMovieJsonPointer(pointer), ['tracks', 'a/b', 'x~y']);
	assert.throws(
		() => parseMovieJsonPointer('/__proto__/polluted'),
		error => error.code === 'MOVIE_PATCH_DANGEROUS_PATH'
	);
	assert.throws(
		() => parseMovieJsonPointer('/bad~2escape'),
		error => error.code === 'INVALID_MOVIE_JSON_POINTER_ESCAPE'
	);
});

test('deterministic diff applies and inverts to exact canonical documents', () => {
	const before = {
		metadata: { author: 'A', removed: true },
		title: 'Before',
		tracks: [{ id: 'one' }]
	};
	const after = {
		metadata: { author: 'B', added: 7 },
		title: 'After',
		tracks: [{ id: 'one' }, { id: 'two' }]
	};
	const patch = diffMovieProjects(before, after);
	assert.deepEqual(applyMovieProjectPatch(before, patch), after);
	assert.deepEqual(
		applyMovieProjectPatch(after, invertMovieProjectPatch(before, patch)),
		before
	);
	assert.deepEqual(patch, diffMovieProjects(before, after));
});

test('array add, remove, replace, and append return a usable inverse', () => {
	const source = { values: ['a', 'b'] };
	const patch = [
		{ op: 'add', path: '/values/-', value: 'c' },
		{ op: 'replace', path: '/values/0', value: 'A' },
		{ op: 'remove', path: '/values/1' }
	];
	const result = applyMovieProjectPatchWithInverse(source, patch);
	assert.deepEqual(result.project, { values: ['A', 'c'] });
	assert.deepEqual(
		applyMovieProjectPatch(result.project, result.inverse),
		source
	);
});

test('root replacement is invertible and root removal is forbidden', () => {
	const source = { a: 1 };
	const result = applyMovieProjectPatchWithInverse(source, [
		{ op: 'replace', path: '', value: { b: 2 } }
	]);
	assert.deepEqual(result.project, { b: 2 });
	assert.deepEqual(applyMovieProjectPatch(result.project, result.inverse), source);
	assert.throws(
		() => applyMovieProjectPatch(source, [{ op: 'remove', path: '' }]),
		error => error.code === 'MOVIE_PATCH_CANNOT_REMOVE_ROOT'
	);
});

test('invalid operation leaves source untouched', () => {
	const source = { nested: { value: 1 } };
	const before = structuredClone(source);
	assert.throws(
		() => applyMovieProjectPatch(source, [
			{ op: 'replace', path: '/nested/missing', value: 2 }
		]),
		error => error.code === 'MOVIE_PATCH_PATH_NOT_FOUND'
	);
	assert.deepEqual(source, before);
});
