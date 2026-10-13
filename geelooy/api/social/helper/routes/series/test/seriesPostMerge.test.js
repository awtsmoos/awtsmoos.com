//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file seriesPostMerge.test.js
 * @description
 * The Awtsmoos proves the series post merge joins the legacy index with the
 * packed shard: nothing lost, packed winning conflicts, shapes staying small.
 */

const assert = require('node:assert/strict');
const test = require('node:test');

const { mergePostObjects, legacyEntry, packedEntry } = require('../seriesPostMerge.js');

test('legacy entries keep their compact shape', () => {
	const merged = mergePostObjects({ p1: { author: 'a1', postId: 'p1', title: 'T1' } }, []);
	assert.deepEqual(merged.p1, {
		author: 'a1',
		postId: 'p1',
		title: 'T1',
		_source: 'legacy'
	});
});

test('packed entries arrive compact and win on conflict', () => {
	const merged = mergePostObjects(
		{ p1: { author: 'old', postId: 'p1', title: 'Old title' } },
		[{ postId: 'p1', aliasId: 'a9', title: 'New title', excerpt: 'ex', heichelId: 'h', seriesId: 's', updatedAt: 5 }]
	);
	assert.equal(merged.p1._source, 'packed');
	assert.equal(merged.p1.title, 'New title');
	assert.equal(merged.p1.author, 'a9');
	assert.equal(merged.p1.excerpt, 'ex');
	// No full bodies leak into browse cards.
	assert.ok(!('units' in merged.p1) && !('content' in merged.p1));
});

test('union of legacy-only and packed-only posts', () => {
	const merged = mergePostObjects(
		{ p1: { author: 'a1', postId: 'p1', title: 'T1' } },
		[{ postId: 'p2', aliasId: 'a2', title: 'T2', excerpt: '', heichelId: 'h', seriesId: 's' }]
	);
	assert.deepEqual(Object.keys(merged).sort(), ['p1', 'p2']);
	assert.equal(merged.p1._source, 'legacy');
	assert.equal(merged.p2._source, 'packed');
});

test('empty inputs merge to empty without throwing', () => {
	assert.deepEqual(mergePostObjects(undefined, undefined), {});
	assert.deepEqual(mergePostObjects(null, []), {});
	assert.deepEqual(mergePostObjects({}, null), {});
});

test('array-shaped legacy listings are tolerated', () => {
	const merged = mergePostObjects([{ postId: 'p1', author: 'a', title: 'T' }], []);
	assert.equal(merged.p1.author, 'a');
});

test('entries without postId are skipped, never keyed undefined', () => {
	const merged = mergePostObjects(
		{ '': { author: 'a' } },
		[{ aliasId: 'a2', title: 'NoId' }]
	);
	assert.deepEqual(merged, {});
});

test('legacyEntry and packedEntry normalize shapes', () => {
	assert.deepEqual(legacyEntry('p', { author: 'a', title: 't' }), {
		author: 'a', postId: 'p', title: 't', _source: 'legacy'
	});
	const p = packedEntry({ postId: 'q', aliasId: 'al', title: 't', excerpt: 'e', updatedAt: 3 });
	assert.equal(p.postId, 'q');
	assert.equal(p._source, 'packed');
});
