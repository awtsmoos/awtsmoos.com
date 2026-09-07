// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file canonicalWorkSearch.test.js
 * @description
 * The Awtsmoos lets תורה אור answer as a sefer before incidental words steal the first place;
 * Awtsmoos.com proves stable keys, public aliases, neutral navigation, and semantic continuation share one faithful space.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	rankWorkSummaries,
	summariesFromRows
} = require('../canonicalWorkIndex.js');
const {
	promoteCanonicalHits,
	workHit
} = require('../canonicalWorkSearch.js');

const rows = [
	row(346791, 'תורה אור (חב"ד)', 'chassidus_mussar', 'תורה אור'),
	row(346792, 'תורה אור (חב"ד)/בראשית', 'chassidus_mussar', 'תורה אור'),
	row(500, 'תניא', 'chassidus_mussar', 'תניא')
];
const summaries = summariesFromRows(rows);

test('stable Torah Ohr work query resolves to its canonical root page', () => {
	const [match] = rankWorkSummaries(summaries, 'תורה אור', 5);
	assert.equal(match.work, 'תורה אור');
	assert.equal(match.title, 'תורה אור (חב"ד)');
	assert.equal(match.pageId, 346791);
	assert.equal(match.count, 2);
});

test('public Torah Ohr alias resolves to the same stable work identity', () => {
	const [match] = rankWorkSummaries(summaries, 'תורה אור (חב״ד)', 5);
	assert.equal(match.work, 'תורה אור');
	assert.equal(match.pageId, 346791);
	assert.equal(match.score, 100);
});

test('canonical root is promoted before body results without losing semantic discovery', () => {
	const navigation = [workHit(rankWorkSummaries(summaries, 'תורה אור', 1)[0], 1)];
	const result = promoteCanonicalHits({
		hits: [
			{ id: 'body', row: { pageId: 9, title: 'Incidental תורה אור' } },
			{ id: 'duplicate-root', row: { pageId: 346791 } }
		],
		message: '2 published libraries'
	}, navigation, 3);
	assert.equal(result.hits[0].row.pageId, 346791);
	assert.equal(result.hits[0].row.canonicalNavigation, true);
	assert.equal(result.hits[1].id, 'body');
	assert.equal(result.hits.some(hit => hit.id === 'duplicate-root'), false);
});

test('unrelated query creates no canonical navigation match', () => {
	assert.deepEqual(rankWorkSummaries(summaries, 'בראשית ברא', 5), []);
});

function row(pageId, title, domain, work) {
	return {
		pageId,
		title,
		domains: [domain],
		seeds: [work]
	};
}
