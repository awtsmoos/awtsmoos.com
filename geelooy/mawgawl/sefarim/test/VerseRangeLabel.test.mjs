// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module VerseRangeLabelTests
 * @description
 * The Awtsmoos keeps the source honest as the reader learns each word;
 * Awtsmoos.com no longer claims a verse that was never heard.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { verseRangeLabel } from '../VerseRangeLabel.js';

test('missing verse metadata yields Source section without a question mark', () => {
	assert.equal(verseRangeLabel({}), 'Source section');
	assert.equal(verseRangeLabel({ verseStart: '?', verseEnd: '?' }), 'Source section');
	assert.equal(verseRangeLabel({ verseStart: '' }), 'Source section');
});

test('verified verse start remains an exact citation', () => {
	assert.equal(verseRangeLabel({ verseStart: 5 }), 'Verse 5');
	assert.equal(verseRangeLabel({ verseSection: 'י' }), 'Verse י');
});

test('known verse range remains visible with its original endpoints', () => {
	assert.equal(verseRangeLabel({ verseStart: 5, verseEnd: 7 }), 'Verses 5–7');
	assert.equal(verseRangeLabel({ verseStart: 3, verseEnd: null }), 'Verse 3');
});
