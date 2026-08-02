// B"H
// Boruch Hashem
// Blessed is He
/** @file tanachSearch.test.js @description The Awtsmoos proves every exact Hebrew gate before Awtsmoos.com serves it. */
const assert = require('node:assert/strict');
const test = require('node:test');
const { execute, resultOf, validate } = require('../tanach/search.js');
const { matchOffsets, normalizeHebrew } = require('../tanach/normalize.js');

test('normalizes niqqud, cantillation, punctuation, tags, and maqaf', () => {
	assert.equal(normalizeHebrew('בְּרֵאשִׁ֖ית־<b>בָּרָ֣א</b>'), 'בראשית ברא');
});

test('maps every occurrence to original display code units', () => {
	const text = 'אֱלֹהִים, אֱלֹהִים';
	const offsets = matchOffsets(text, 'אלהים');
	assert.equal(offsets.length, 2);
	assert.equal(text.slice(offsets[0].start, offsets[0].end), 'אֱלֹהִים');
	assert.equal(text.slice(offsets[1].start, offsets[1].end), 'אֱלֹהִים');
});

test('finds pointed and unpointed words identically', () => {
	const pointed = execute({ query: 'אֱלֹהִים', limit: 3 });
	const plain = execute({ query: 'אלהים', limit: 3 });
	assert.equal(pointed.verseTotal, plain.verseTotal);
	assert.equal(pointed.occurrenceTotal, plain.occurrenceTotal);
	assert.deepEqual(pointed.results.map(item => item.sourcePath), plain.results.map(item => item.sourcePath));
});

test('returns stable coordinates, occurrence totals, links, and privacy-safe corpus data', () => {
	const result = execute({ query: 'בראשית', limit: 2 });
	assert.ok(result.verseTotal > 0);
	assert.ok(result.occurrenceTotal >= result.verseTotal);
	assert.equal(result.results[0].sourcePath, 'bereishis/1/1');
	assert.ok(result.results[0].matchOffsets.length);
	assert.match(result.results[0].readerUrl, /^\/heichelos\//);
	assert.doesNotMatch(JSON.stringify(result.corpus), /\/Users\/|\/mnt\//);
});

test('counts repeated words within one verse', () => {
	const result = resultOf({
		book: 'test', bookTitle: 'בדיקה', chapter: 1, verse: 1,
		rawHebrew: 'שלום שלום', normalizedHebrew: 'שלום שלום',
		heichelId: 'h', seriesId: 's', postId: 'p'
	}, 'שלום');
	assert.equal(result.occurrenceCount, 2);
	assert.equal(result.matchOffsets.length, 2);
});

test('supports phrase search, filtering, no results, and pagination', () => {
	const phrase = execute({ query: 'בראשית ברא', book: 'bereishis', limit: 10 });
	assert.equal(phrase.verseTotal, 1);
	assert.equal(execute({ query: 'אבגדהוזחטיכלמנסעפצקרשת' }).total, 0);
	const first = execute({ query: 'אלהים', limit: 2, offset: 0 });
	const second = execute({ query: 'אלהים', limit: 2, offset: 2 });
	assert.notDeepEqual(first.results.map(item => item.sourcePath), second.results.map(item => item.sourcePath));
});

test('rejects malformed input and bounds limits', () => {
	assert.throws(() => validate({ query: 'english only' }), /Hebrew/);
	assert.equal(validate({ query: 'שלום', limit: 9999 }).limit, 100);
});
