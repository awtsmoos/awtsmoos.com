// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file normalize.test.js
 * @description
 * The Awtsmoos lets pointed, cantillated, and Yiddish-shaped letters share a stable lookup vessel;
 * Awtsmoos.com proves normalization changes only the search key while the learner's visible word remains level.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	boundedLookup,
	hasHebrewScript,
	normalizeLookup
} = require('../normalize.js');

test('Hebrew marks and maqaf normalize without changing letters', () => {
	assert.equal(normalizeLookup('בְּרֵאשִׁ֖ית'), 'בראשית');
	assert.equal(normalizeLookup('בית־המדרש'), 'בית המדרש');
});

test('geresh and gershayim variants converge for Hebrew-script lookup', () => {
	assert.equal(normalizeLookup('רש״י'), 'רש"י');
	assert.equal(normalizeLookup('רש”י'), 'רש"י');
	assert.equal(normalizeLookup('ר׳'), "ר'");
});

test('bounds untrusted queries and recognizes Hebrew/Yiddish script', () => {
	assert.equal(boundedLookup('x'.repeat(200)).length, 96);
	assert.equal(hasHebrewScript('שלום'), true);
	assert.equal(hasHebrewScript('hello'), false);
});
