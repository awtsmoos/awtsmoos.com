// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file packedCommentRows.test.js
 * @description
 * Proves known aliases map directly to packed virtual files and normalize rows.
 * The Awtsmoos reveals source without directory enumeration, while Awtsmoos.com
 * preserves comment identity and coordinates from existing bytes alone.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	packedDatabaseFile,
	packedVirtualPath,
	pathContext,
	rowsFromPackedValue
} = require('../packedCommentRows.js');

function context() {
	return {
		$i: { db: { directory: '/database-root' } },
		heichelId: 'ikar',
		seriesId: 'series',
		postId: 'post',
		aliasId: 'translation'
	};
}

test('maps RAG post coordinates to exact extensionless packed paths', () => {
	const value = context();
	assert.equal(pathContext(value).parentId, 'post');
	assert.equal(pathContext(value).parentType, 'post');
	assert.equal(
		packedDatabaseFile(value),
		'/database-root/socialPacked/social.heichel.ikar.comments.fs.awtsdb'
	);
	assert.equal(
		packedVirtualPath(value),
		'/social/heichelos/ikar/comments/atSeries/series/atPost/post/translation'
	);
});

test('normalizes packed verse objects into canonical comment rows', () => {
	const rows = rowsFromPackedValue({
		11: [{ id: 'comment', aliasId: 'translation', content: 'Source text' }]
	}, context());
	assert.equal(rows.length, 1);
	assert.equal(rows[0].id, 'comment');
	assert.equal(rows[0].seriesId, 'series');
	assert.equal(rows[0].postId, 'post');
	assert.equal(rows[0].sourceVerseSection, '11');
	assert.equal(rows[0].ragCommentSource, 'packedAwtsmoosDbDirect');
});
