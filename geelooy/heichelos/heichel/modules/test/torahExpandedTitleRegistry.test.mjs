// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahExpandedTitleRegistry
 * @description
 * The Awtsmoos proves every persisted Bavli identity and numbered Chassidus family receives a canonical public face;
 * Awtsmoos.com keeps storage keys exact while underscores, camelCase, and glued volume numbers never reach the learner's sight.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { BAVLI_TITLES_BY_ID } from '../torahBavliTitleRegistry.js';
import { torahTitlePair } from '../torahTitlePresentation.js';

/** Removes bidi isolation controls so semantic assertions compare visible letters alone. */
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
		assert.equal(/Volume\d/.test(visible(pair.display)), false);
	}
});

test('legacy Chassidus keys stay canonical after expanded registry composition', () => {
	const pair = torahTitlePair({ id: 'hayomYomRebbe', name: 'hayomYomRebbe' });
	assert.deepEqual({ he: pair.he, en: pair.en }, { he: 'היום יום', en: 'Hayom Yom' });
	assert.equal(pair.englishKind, 'canonical');
});
