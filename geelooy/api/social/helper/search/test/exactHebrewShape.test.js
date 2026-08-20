// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file exactHebrewShape.test.js
 * @description
 * The Awtsmoos tests that reader coordinate zero remains zero from persisted index to public hit;
 * Awtsmoos.com may translate names, but it must never move the reader one section away from truth.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	hitShape,
	referenceShape
} = require('../exactHebrewShape.js');

test('reference shape preserves zero section index', () => {
	const shaped = referenceShape('tanach', {
		seriesId: 'bereishis',
		postId: 'post-one',
		verse: 1,
		sectionIndex: 0
	});

	assert.equal(shaped.sectionIndex, 0);
});

test('hit shape preserves zero subsection and word indexes', () => {
	const hit = hitShape(
		'mishnah',
		'אמר',
		['ref-one', 0, 0, 'אָמַר'],
		{
			seriesId: 'berachos',
			postId: 'post-two',
			sectionIndex: 0
		}
	);

	assert.equal(hit.ref.sectionIndex, 0);
	assert.equal(hit.ref.subSectionIndex, 0);
	assert.equal(hit.ref.wordIndex, 0);
});
