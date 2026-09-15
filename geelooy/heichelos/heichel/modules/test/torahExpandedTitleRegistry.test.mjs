//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import test from 'node:test';
import { BAVLI_TITLES_BY_ID } from '../torahBavliTitleRegistry.js';
import { torahTitlePair } from '../torahTitlePresentation.js';

/**
 * @file Canonical bilingual Torah-title presentation tests.
 * @description The Awtsmoos lets Awtsmoos.com clothe stable Torah identities canonically,
 * so malformed stored labels, internal IDs, and glued numbered families never become the learner's public title.
 */
function visible(value) {
	return String(value).replace(/[\u2066\u2067\u2069]/g, '');
}

test('all persisted Bavli tractate IDs resolve to canonical bilingual titles', () => {
	assert.equal(Object.keys(BAVLI_TITLES_BY_ID).length, 36);
	for (const [id, canonical] of Object.entries(BAVLI_TITLES_BY_ID)) {
		const pair = torahTitlePair({ id, name: id });
		assert.equal(pair.he, canonical.he, id);
		assert.equal(pair.en, canonical.en, id);
		assert.equal(pair.englishKind, 'canonical', id);
		assert.equal(visible(pair.display).includes('_'), false, id);
	}
});

test('numbered Torah families resolve without glued internal route names', () => {
	const first = torahTitlePair({ id: 'likkuteiSichosVolume1', name: 'likkuteiSichosVolume1' });
	const last = torahTitlePair({ id: 'likkuteiSichosVolume39', name: 'likkuteiSichosVolume39' });
	const sefer = torahTitlePair({ id: 'seferHaSichos5752', name: 'seferHaSichos5752' });
	const kodesh = torahTitlePair({ id: 'sichosKodesh5741', name: 'sichosKodesh5741' });
	assert.equal(first.he, 'לקוטי שיחות חלק 1');
	assert.equal(first.en, 'Likkutei Sichos, Vol. 1');
	assert.equal(last.en, 'Likkutei Sichos, Vol. 39');
	assert.equal(sefer.en, 'Sefer HaSichos 5752');
	assert.equal(kodesh.en, 'Sichos Kodesh 5741');
	for (const pair of [first, last, sefer, kodesh]) {
		assert.equal(pair.englishKind, 'canonical');
		assert.equal(/Volume\d/u.test(visible(pair.display)), false);
	}
});

test('stable IDs override historically bad stored public labels', () => {
	const cases = [
		[{ id: 'mishnehTorah', name: 'Book of the Love of the Awtsmoos' }, 'משנה תורה', 'Mishneh Torah'],
		[{ id: 'seferHatanya', name: 'Sefer Hatanya - rough transliteration' }, 'ספר התניא', 'Tanya'],
		[{ id: 'mishnah', name: 'mishnah' }, 'משנה', 'Mishnah'],
		[{ id: 'likkuteiSichosVolume10', name: 'Ikar' }, 'לקוטי שיחות חלק 10', 'Likkutei Sichos, Vol. 10'],
		[{ id: 'seferHaSichos5752', name: 'BH_INTERNAL_RAW_ID' }, 'ספר השיחות 5752', 'Sefer HaSichos 5752']
	];
	for (const [input, he, en] of cases) {
		const pair = torahTitlePair(input);
		assert.deepEqual({ he: pair.he, en: pair.en }, { he, en }, input.id);
		assert.equal(pair.englishKind, 'canonical', input.id);
		assert.equal(visible(pair.display).includes(input.name), false, input.id);
	}
});

test('legacy Chassidus keys stay canonical after expanded registry composition', () => {
	const pair = torahTitlePair({ id: 'hayomYomRebbe', name: 'hayomYomRebbe' });
	assert.deepEqual({ he: pair.he, en: pair.en }, { he: 'היום יום', en: 'Hayom Yom' });
	assert.equal(pair.englishKind, 'canonical');
});
