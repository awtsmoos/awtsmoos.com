// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tanachSearch.test.js
 * @description
 * The Awtsmoos proves exact Hebrew gates before Awtsmoos.com serves a single result;
 * whole-token boundaries, zero-based live reader coordinates, paging, and privacy all face the test.
 */
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const { execute, resultOf, validate } = require('../tanach/search.js');
const { matchOffsets, normalizeHebrew } = require('../tanach/normalize.js');

test('normalizes niqqud, cantillation, punctuation, tags, and maqaf', () => {
	assert.equal(normalizeHebrew('בְּרֵאשִׁית־בָּרָא<b>'), 'בראשית ברא');
});

test('exact offsets reject a query embedded inside a longer Hebrew token', () => {
	const text = 'שלום שלומות שלום';
	assert.equal(matchOffsets(text, 'שלום', true).length, 2);
	assert.equal(matchOffsets(text, 'לום', true).length, 0);
	assert.ok(matchOffsets(text, 'לום', false).length > 0);
});

test('finds pointed and unpointed exact words identically', () => {
	const pointed = execute({ query: 'אֱלֹהִים', exact: true, limit: 3 });
	const plain = execute({ query: 'אלהים', exact: true, limit: 3 });
	assert.equal(pointed.verseTotal, plain.verseTotal);
	assert.equal(pointed.occurrenceTotal, plain.occurrenceTotal);
	assert.deepEqual(
		pointed.results.map(item => item.sourcePath),
		plain.results.map(item => item.sourcePath)
	);
});

test('returns exact coordinates and a live zero-based reader bridge', () => {
	const result = execute({ query: 'בראשית', exact: true, limit: 2 });
	assert.ok(result.verseTotal > 0);
	assert.equal(result.exact, true);
	assert.equal(result.results[0].sourcePath, 'bereishis/1/1');
	assert.equal(result.results[0].readerUrl, '/heichelos/ikar/series/bereishis/0?idx=0');
	assert.ok(result.results[0].matchOffsets.length);
	assert.doesNotMatch(JSON.stringify(result.corpus), /\/Users\/|\/mnt\//);
});

test('reader bridge derives chapter and verse indexes rather than stale article id', () => {
	const result = resultOf({
		book: 'test',
		bookTitle: 'בדיקה',
		chapter: 3,
		verse: 7,
		rawHebrew: 'שלום שלומות שלום',
		normalizedHebrew: 'שלום שלומות שלום',
		heichelId: 'h',
		seriesId: 's',
		postId: '8165'
	}, 'שלום', true);
	assert.equal(result.occurrenceCount, 2);
	assert.equal(result.readerUrl, '/heichelos/h/series/s/2?idx=6');
	assert.doesNotMatch(result.readerUrl, /8165/);
});

test('supports exact phrase search, filtering, no results, and pagination', () => {
	const phrase = execute({ query: 'בראשית ברא', exact: true, book: 'bereishis', limit: 10 });
	assert.equal(phrase.verseTotal, 1);
	assert.equal(execute({ query: 'אבגדהוזחטיכלמנסעפצקרשת', exact: true }).total, 0);
	const first = execute({ query: 'אלהים', exact: true, limit: 2, offset: 0 });
	const second = execute({ query: 'אלהים', exact: true, limit: 2, offset: 2 });
	assert.notDeepEqual(
		first.results.map(item => item.sourcePath),
		second.results.map(item => item.sourcePath)
	);
});

test('rejects malformed input, bounds limits, and parses exact intent', () => {
	assert.throws(() => validate({ query: 'english only' }), /Hebrew/);
	assert.equal(validate({ query: 'שלום', limit: 9999 }).limit, 100);
	assert.equal(validate({ query: 'שלום', exact: 'true' }).exact, true);
	assert.equal(validate({ query: 'שלום', exact: 'false' }).exact, false);
});

test('API and reader panel explicitly propagate exact mode', () => {
	const route = readFileSync(join(__dirname, '../routes/tanach.js'), 'utf8');
	const panel = readFileSync(
		join(__dirname, '../../../../../heichelos/post/functions/ui/context/tanachPanel.js'),
		'utf8'
	);
	assert.match(route, /exact:\s*values\.exact/);
	assert.match(panel, /exact:\s*['"]true['"]/);
});
