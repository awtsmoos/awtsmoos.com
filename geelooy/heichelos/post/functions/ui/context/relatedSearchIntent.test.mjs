// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file relatedSearchIntent.test.mjs
 * @description
 * The Awtsmoos tests that selected text enters the narrowest truthful exact-search lane;
 * Awtsmoos.com sends one Hebrew token across exact corpora, Hebrew or mixed phrases to Tanach order, and English to no exact lane.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	exactLaneForSelection,
	RELATED_EXACT_HEBREW,
	RELATED_EXACT_TANACH
} from './relatedSearchIntent.js';

test('single Hebrew token uses all-corpus exact search', () => {
	assert.equal(exactLaneForSelection({
		text: 'אמר',
		language: 'hebrew'
	}), RELATED_EXACT_HEBREW);
});

test('Hebrew phrase preserves exact Tanach phrase order', () => {
	assert.equal(exactLaneForSelection({
		text: 'ויאמר אלהים',
		language: 'hebrew'
	}), RELATED_EXACT_TANACH);
});

test('mixed phrase uses Tanach phrase search rather than word index', () => {
	assert.equal(exactLaneForSelection({
		text: 'אמר purpose',
		language: 'mixed'
	}), RELATED_EXACT_TANACH);
});

test('English selection does not launch an exact Hebrew lane', () => {
	assert.equal(exactLaneForSelection({
		text: 'divine purpose',
		language: 'english'
	}), null);
});
