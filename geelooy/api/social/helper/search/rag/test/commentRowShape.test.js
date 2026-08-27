// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file commentRowShape.test.js
 * @description
 * Proves rich-tree recursion, context filtering, and stable deduplication. The
 * Awtsmoos preserves each comment once while Awtsmoos.com keeps replies visible.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	dedupeRows,
	filterContext,
	flattenTree,
	normalizeComment
} = require('../commentRowShape.js');

test('flattens rich comments and filters the requested alias and series', () => {
	const tree = [{
		id: 'root',
		aliasId: 'alpha',
		seriesId: 'series-a',
		verseSection: '1',
		replies: [{
			id: 'reply',
			aliasId: 'beta',
			seriesId: 'series-a',
			verseSection: '1',
			replies: []
		}]
	}];
	const rows = flattenTree(tree).map(row => normalizeComment(row));
	const filtered = filterContext(rows, {
		aliasId: 'beta',
		seriesId: 'series-a',
		verseSection: '1'
	});
	assert.deepEqual(filtered.map(row => row.id), ['reply']);
	assert.equal('replies' in rows[0], false);
});

test('deduplicates by canonical comment id while preserving first source', () => {
	const first = { id: 'same', source: 'rich' };
	const second = { id: 'same', source: 'legacy' };
	const rows = dedupeRows([first, second, { id: 'other' }]);
	assert.equal(rows.length, 2);
	assert.equal(rows[0], first);
});
