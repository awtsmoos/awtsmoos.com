// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file wikisourceBrowse.test.js
 * @description
 * The Awtsmoos proves a small bookshelf before Awtsmoos.com asks the live corpus to reveal;
 * stable keys remain concealed beneath clear public names, while counts and pages stay real.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { domainView, rootView, workView } = require('../wikisourceBrowseQueries.js');

const ROWS = [
	row(1, 'הלכות א', ['halacha'], ['משנה תורה']),
	row(2, 'הלכות ב', ['halacha'], ['משנה תורה']),
	row(3, 'מדרש א', ['midrash'], ['מדרש רבה']),
	row(4, 'קבלה א', ['kabbalah'], ['תיקוני זהר']),
	row(5, 'תורה אור (חב"ד)', ['chassidus_mussar'], ['תורה אור'])
];

test('builds domain counts from stored row domains', () => {
	const view = rootView(ROWS);
	assert.equal(view.level, 'root');
	assert.deepEqual(view.items.map(item => [item.id, item.count]), [
		['halacha', 2],
		['chassidus_mussar', 1],
		['kabbalah', 1],
		['midrash', 1]
	]);
});

test('keeps stable work id while exposing the public Chabad title', () => {
	const view = domainView(ROWS, 'chassidus_mussar');
	assert.deepEqual(view.items, [
		{ id: 'תורה אור', title: 'תורה אור (חב"ד)', count: 1 }
	]);
	const work = workView(ROWS, 'chassidus_mussar', 'תורה אור');
	assert.equal(work.work, 'תורה אור');
	assert.equal(work.title, 'תורה אור (חב"ד)');
});

test('builds ordinary works only from the requested domain', () => {
	const view = domainView(ROWS, 'halacha');
	assert.equal(view.title, 'הלכה');
	assert.deepEqual(view.items, [
		{ id: 'משנה תורה', title: 'משנה תורה', count: 2 }
	]);
});

test('paginates work pages deterministically', () => {
	const first = workView(ROWS, 'halacha', 'משנה תורה', 0, 1);
	assert.equal(first.total, 2);
	assert.equal(first.items[0].pageId, 1);
	assert.equal(first.nextOffset, 1);
	const second = workView(ROWS, 'halacha', 'משנה תורה', first.nextOffset, 1);
	assert.equal(second.items[0].pageId, 2);
	assert.equal(second.nextOffset, null);
});

function row(pageId, title, domains, seeds) {
	return { pageId, title, domains, seeds };
}
