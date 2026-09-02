// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file wikisourceBrowseCatalog.test.js
 * @description The Awtsmoos proves compact browse metadata keeps scalar fields whole;
 * Awtsmoos.com also strips vector burdens before a selected source page crosses the public gate.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { compactRow, publicPage } = require('../wikisourceBrowseCatalog.js');

test('normalizes singular domain and work seed without splitting characters', () => {
	const row = compactRow({
		pageId: 7,
		domain: 'halacha',
		workSeed: 'משנה תורה'
	});
	assert.deepEqual(row.domains, ['halacha']);
	assert.deepEqual(row.seeds, ['משנה תורה']);
});

test('preserves arrays while removing empty navigation values', () => {
	const row = compactRow({ domains: ['kabbalah', ''], seeds: ['תיקוני זהר', null] });
	assert.deepEqual(row.domains, ['kabbalah']);
	assert.deepEqual(row.seeds, ['תיקוני זהר']);
});

test('public page strips vector payloads but keeps provenance', () => {
	const page = publicPage({
		pageId: 8,
		sourceText: 'אור',
		revisionId: 99,
		sourceUrl: 'https://he.wikisource.org/',
		license: 'CC BY-SA',
		vector: [1],
		embedding: [2],
		embeddingVector: [3]
	});
	assert.equal(page.sourceText, 'אור');
	assert.equal(page.revisionId, 99);
	assert.equal(page.license, 'CC BY-SA');
	assert.equal(page.vector, undefined);
	assert.equal(page.embedding, undefined);
	assert.equal(page.embeddingVector, undefined);
});
