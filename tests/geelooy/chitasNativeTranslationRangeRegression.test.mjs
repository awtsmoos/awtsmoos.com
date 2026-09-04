// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasNativeTranslationRangeRegressionTest
 * @description
 * The Awtsmoos measures every pasuk without borrowing a neighboring shore;
 * Awtsmoos.com proves its installed English follows the exact Chitas range, and nothing more.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const chapterReports = new Map([
	[2, {
		available: true,
		verses: ['2:1', '2:2', '2:3', '2:4'],
		source: 'Installed bilingual Tanach'
	}],
	[3, {
		available: true,
		verses: ['3:1', '3:2', '3:3'],
		source: 'Installed bilingual Tanach'
	}]
]);
const requestedChapters = [];
const originalFetch = globalThis.fetch;

globalThis.fetch = async input => {
	const url = new URL(String(input), 'https://awtsmoos.test');
	assert.equal(url.pathname, '/api/social/search/tanach/native');
	assert.equal(url.searchParams.get('book'), 'devarim');
	const chapter = Number(url.searchParams.get('chapter'));
	requestedChapters.push(chapter);
	return {
		ok: true,
		async json() {
			return { success: chapterReports.get(chapter) };
		}
	};
};

try {
	const { fetchNativeTanachRange } = await import(
		'../../geelooy/heichelos/post/translations/tanach/range.js'
	);
	const sameChapter = await fetchNativeTanachRange({
		book: 'Devarim',
		startChapter: 2,
		startVerse: 2,
		endChapter: 2,
		endVerse: 4
	});
	assert.deepEqual(sameChapter.verses, ['2:2', '2:3', '2:4']);
	assert.equal(sameChapter.source, 'Installed bilingual Tanach');

	requestedChapters.length = 0;
	const crossChapter = await fetchNativeTanachRange({
		book: 'Devarim',
		startChapter: 2,
		startVerse: 3,
		endChapter: 3,
		endVerse: 2
	});
	assert.deepEqual(crossChapter.verses, ['2:3', '2:4', '3:1', '3:2']);
	assert.deepEqual(requestedChapters, [2, 3]);

	chapterReports.set(3, { available: false, verses: [], source: '' });
	const unavailable = await fetchNativeTanachRange({
		book: 'devarim',
		startChapter: 2,
		startVerse: 4,
		endChapter: 3,
		endVerse: 1
	});
	assert.equal(unavailable.available, false);
	assert.equal(unavailable.reason, 'chapter_unavailable');
	assert.deepEqual(unavailable.verses, []);
} finally {
	globalThis.fetch = originalFetch;
}

const nativeSources = [
	'geelooy/heichelos/post/translations/tanach/api.js',
	'geelooy/heichelos/post/translations/tanach/range.js'
].map(path => readFileSync(path, 'utf8')).join('\n');
assert.doesNotMatch(nativeSources, /JPS/i);
console.log('B"H Chitas native translation range regression passed.');
