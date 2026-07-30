// B"H
// Boruch Hashem
// Blessed is He
/** @file tanachSearch.test.js @description The Awtsmoos proves every bounded Hebrew gate before Awtsmoos.com serves it. */
const assert = require('node:assert/strict');
const test = require('node:test');
const { execute, validate } = require('../tanach/search.js');
const { normalizeHebrew } = require('../tanach/normalize.js');

test('normalizes niqqud, cantillation, punctuation, and maqaf', () => {
	assert.equal(normalizeHebrew('בְּרֵאשִׁ֖ית־בָּרָ֣א'), 'בראשית ברא');
});

test('finds pointed and unpointed common words identically', () => {
	const pointed = execute({ query: 'אֱלֹהִים', limit: 3 });
	const plain = execute({ query: 'אלהים', limit: 3 });
	assert.equal(pointed.total, plain.total);
	assert.deepEqual(pointed.results.map(result => result.sourcePath), plain.results.map(result => result.sourcePath));
});

test('returns stable coordinates, offsets, totals, links, and provenance', () => {
	const result = execute({ query: 'בראשית', limit: 2 });
	assert.ok(result.total > 0);
	assert.equal(result.results[0].book, 'bereishis');
	assert.equal(result.results[0].chapter, 1);
	assert.equal(result.results[0].verse, 1);
	assert.ok(result.results[0].matchOffsets.length);
	assert.match(result.results[0].readerUrl, /^\/heichelos\//);
	assert.match(result.results[0].provenance, /persisted/);
});

test('supports exact phrase search and book filtering', () => {
	const result = execute({ query: 'בראשית ברא', book: 'bereishis', limit: 10 });
	assert.equal(result.total, 1);
	assert.equal(result.results[0].sourcePath, 'bereishis/1/1');
});

test('supports no results and deterministic pagination', () => {
	assert.equal(execute({ query: 'אבגדהוזחטיכלמנסעפצקרשת', limit: 5 }).total, 0);
	const first = execute({ query: 'אלהים', limit: 2, offset: 0 });
	const second = execute({ query: 'אלהים', limit: 2, offset: 2 });
	assert.notDeepEqual(first.results.map(item => item.sourcePath), second.results.map(item => item.sourcePath));
});

test('rejects malformed input and bounds maximum limits', () => {
	assert.throws(() => validate({ query: 'english only' }), /Hebrew/);
	assert.equal(validate({ query: 'שלום', limit: 9999 }).limit, 100);
});
