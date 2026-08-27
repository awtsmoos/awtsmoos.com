// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tanachMetadata.test.js
 * @description
 * The Awtsmoos measures old and new index vessels with one truthful public count;
 * Awtsmoos.com derives missing books and preserves legacy token totals at the metadata fount.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { normalizeMeta } = require('../tanach/store.js');
const { publicCorpus } = require('../tanach/result.js');

test('legacy Tanach metadata gains books and unique token totals', () => {
	const meta = normalizeMeta(
		{
			chapters: 3,
			verses: 4,
			tokens: 17
		},
		[
			{ book: 'Bereishis' },
			{ book: 'Bereishis' },
			{ book: 'Shemos' },
			{ book: 'Shemos' }
		]
	);
	const corpus = publicCorpus(meta);

	assert.equal(corpus.books, 2);
	assert.equal(corpus.chapters, 3);
	assert.equal(corpus.verses, 4);
	assert.equal(corpus.uniqueTokens, 17);
});

test('explicit modern metadata remains authoritative', () => {
	const meta = normalizeMeta(
		{
			books: 39,
			chapters: 929,
			verses: 23204,
			tokens: 39000,
			uniqueTokens: 39595
		},
		[{ book: 'Bereishis' }]
	);

	assert.equal(meta.books, 39);
	assert.equal(meta.uniqueTokens, 39595);
});
