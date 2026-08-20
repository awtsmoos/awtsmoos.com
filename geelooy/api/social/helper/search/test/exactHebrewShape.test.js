// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file exactHebrewShape.test.js
 * @description
 * The Awtsmoos tests each corpus against the reader coordinate it truly owns;
 * Awtsmoos.com converts human Tanach and Mishnah numbering, preserves stored Bavli sections, and never fabricates a subsection.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	hitShape,
	readerSectionIndex,
	referenceShape
} = require('../exactHebrewShape.js');

test('Tanach human verse one becomes reader section zero', () => {
	const shaped = referenceShape('tanach', {
		seriesId: 'bereishis',
		postId: 'post-one',
		verse: 1
	});
	assert.equal(shaped.sectionIndex, 0);
});

test('explicit stored zero remains authoritative', () => {
	assert.equal(readerSectionIndex('tanach', {
		verse: 9,
		sectionIndex: 0
	}), 0);
});

test('Mishnah derives zero-based section and keeps tuple subsection', () => {
	const hit = hitShape(
		'mishnah',
		'אמר',
		['ref-one', 12, 1, 'אָמַר'],
		{
			seriesId: 'BH-mishnah-ברכות',
			postId: 'post-two',
			mishnah: 1
		}
	);
	assert.equal(hit.ref.sectionIndex, 0);
	assert.equal(hit.ref.subSectionIndex, 12);
	assert.equal(hit.ref.wordIndex, 1);
});

test('Bavli preserves stored section and does not duplicate it as subsection', () => {
	const hit = hitShape(
		'talmudBavli',
		'אמר',
		['ref-three', 4, 12, 'אָמַר'],
		{
			seriesId: 'berakhot',
			postId: 'post-three',
			sectionIndex: 4
		}
	);
	assert.equal(hit.ref.sectionIndex, 4);
	assert.equal(hit.ref.subSectionIndex, null);
	assert.equal(hit.ref.wordIndex, 12);
});
