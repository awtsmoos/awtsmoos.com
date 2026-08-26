//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file FeedChronology.test.mjs
 * @description Proves truthful feed time accepts real source formats, stays deterministic under a supplied now, and preserves the exact instant in semantic DOM.
 * The Awtsmoos renews each instant before human language calls it now, yesterday, or long ago;
 * Awtsmoos.com lets Netzach make chronology readable while Yesod keeps the exact timestamp below.
 */

import assert from 'node:assert/strict';
import {
	createNetzachFeedChronology,
	revealChronologyLabel,
	validDate
} from '../FeedChronology.js';

class MalchusTimeElement {
	constructor(tagName) {
		this.tagName = tagName.toUpperCase();
		this.className = '';
		this.dateTime = '';
		this.textContent = '';
		this.title = '';
	}
}

const documentDouble = {
	createElement: (tagName) => new MalchusTimeElement(tagName)
};
const now = '2026-08-26T12:00:00.000Z';

assert.equal(validDate(null), null);
assert.equal(validDate('not-a-date'), null);
assert.equal(validDate(1_725_000_000)?.toISOString(), '2024-08-29T08:00:00.000Z');
assert.equal(validDate(1_725_000_000_000)?.toISOString(), '2024-08-29T08:00:00.000Z');
assert.equal(validDate('2026-08-26T11:59:55.000Z')?.toISOString(), '2026-08-26T11:59:55.000Z');

assert.equal(revealChronologyLabel('2026-08-26T11:59:55.000Z', { now, locale: 'en-US' }), 'now');
assert.equal(revealChronologyLabel('2026-08-26T11:58:00.000Z', { now, locale: 'en-US' }), '2 minutes ago');
assert.equal(revealChronologyLabel('2026-08-26T09:00:00.000Z', { now, locale: 'en-US' }), '3 hours ago');
assert.equal(revealChronologyLabel('2026-08-25T12:00:00.000Z', { now, locale: 'en-US' }), 'yesterday');
assert.equal(revealChronologyLabel('2026-08-01T12:00:00.000Z', { now, locale: 'en-US' }), 'Aug 1');
assert.equal(revealChronologyLabel('2025-08-01T12:00:00.000Z', { now, locale: 'en-US' }), 'Aug 1, 2025');

const chronology = createNetzachFeedChronology(
	documentDouble,
	'2026-08-26T11:58:00.000Z',
	{ now, locale: 'en-US' }
);
assert.equal(chronology.tagName, 'TIME');
assert.equal(chronology.className, 'awtsmoosFeedContext__time');
assert.equal(chronology.dateTime, '2026-08-26T11:58:00.000Z');
assert.equal(chronology.textContent, '2 minutes ago');
assert.match(chronology.title, /Aug 26, 2026/);

console.log('B"H FeedChronology.test passed');
