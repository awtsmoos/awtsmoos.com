// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mergeSourceDedup.test.js
 * @description
 * Iteration 7 pins merged-window diversity: the visitor battery's keyword
 * top-5 was five consecutive segments of one source at a tied score. The
 * merge now takes at most two hits per source in its first pass and lets
 * deferred same-source hits fill only the room other sources leave.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { rankedMergeHits } = require('../librarySearchMergeHelpers.js');

function hit(percent, postId) {
	return {
		percent,
		score: percent / 100,
		row: postId ? { postId } : {}
	};
}

test('one source cannot fill the visible window while others wait', () => {
	const merged = rankedMergeHits([
		[hit(90, 'P1'), hit(89, 'P1'), hit(88, 'P1'), hit(87, 'P1'), hit(86, 'P1')],
		[hit(85, 'P2'), hit(84, 'P3')]
	], 5);
	assert.deepEqual(
		merged.map(entry => entry.row.postId),
		['P1', 'P1', 'P2', 'P3', 'P1']
	);
	assert.deepEqual(merged.map(entry => entry.rank), [1, 2, 3, 4, 5]);
});

test('deferred same-source hits fill a window other sources cannot', () => {
	const merged = rankedMergeHits([
		[hit(90, 'P1'), hit(89, 'P1'), hit(88, 'P1'), hit(87, 'P1')]
	], 4);
	assert.equal(merged.length, 4);
	assert.deepEqual(merged.map(entry => entry.percent), [90, 89, 88, 87]);
});

test('hits without source identity are never treated as siblings', () => {
	const merged = rankedMergeHits([
		[hit(90), hit(89), hit(88)]
	], 3);
	assert.equal(merged.length, 3);
	assert.deepEqual(merged.map(entry => entry.percent), [90, 89, 88]);
});
