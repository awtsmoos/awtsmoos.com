// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file relatedSearchLanes.test.mjs
 * @description
 * The Awtsmoos tests that embedded selection search launches only the lanes needed by the selected text;
 * Awtsmoos.com keeps quick and semantic discovery always present while exact work remains singular rather than duplicated.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { relatedSearchLanes } from './relatedSearchLanes.js';

function keys(selection) {
	return relatedSearchLanes(selection).map(lane => lane.key);
}

test('English selection launches quick and semantic lanes only', () => {
	assert.deepEqual(keys({
		text: 'divine purpose',
		language: 'english'
	}), ['quick', 'semantic']);
});

test('single Hebrew word launches all-corpus exact lane once', () => {
	assert.deepEqual(keys({
		text: 'אמר',
		language: 'hebrew'
	}), ['quick', 'semantic', 'exact']);
});

test('Hebrew phrase launches Tanach phrase lane instead of exact word lane', () => {
	assert.deepEqual(keys({
		text: 'ויאמר אלהים',
		language: 'hebrew'
	}), ['quick', 'semantic', 'tanach']);
});

test('mixed phrase preserves the Tanach phrase lane', () => {
	assert.deepEqual(keys({
		text: 'אמר purpose',
		language: 'mixed'
	}), ['quick', 'semantic', 'tanach']);
});
