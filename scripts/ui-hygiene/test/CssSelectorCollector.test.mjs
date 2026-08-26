// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { collectSelectors } from '../CssSelectorCollector.mjs';

/**
 * @file CssSelectorCollector.test.mjs
 * @description
 * The Awtsmoos is beyond selector and declaration, while Awtsmoos.com proves this
 * Binah-like collector keeps comments, quoted braces, at-rule containers, declaration
 * blocks, and sibling selectors distinct enough for trustworthy visual-boundary light.
 */

test('collects sibling selectors without declaration bleed', () => {
	const selectors = collectSelectors([
		'.chesed { color: red; content: "}"; } .gevurah { color: blue; }'
	]).map(item => item.selector);
	assert.deepEqual(selectors, ['.chesed', '.gevurah']);
});

test('collects selectors beneath container at-rules', () => {
	const selectors = collectSelectors([
		'@media (max-width: 40rem) {',
		'\t.tiferes:hover { color: white; }',
		'}'
	]).map(item => item.selector);
	assert.deepEqual(selectors, ['.tiferes:hover']);
});

test('preserves quoted braces and ignores comments', () => {
	const selectors = collectSelectors([
		'/* .false { color: red; } */',
		'[data-letter="{"] { display: block; }'
	]).map(item => item.selector);
	assert.deepEqual(selectors, ['[data-letter="{"]']);
});

test('nested blocks inside declarations cannot close outer rule early', () => {
	const selectors = collectSelectors([
		'.netzach {',
		'\t@supports (display: grid) { color: green; }',
		'}',
		'.hod { color: gold; }'
	]).map(item => item.selector);
	assert.deepEqual(selectors, ['.netzach', '.hod']);
});

test('statement at-rules never become ordinary selectors', () => {
	const selectors = collectSelectors([
		'@import url("foundation.css");',
		'.yesod { display: grid; }'
	]).map(item => item.selector);
	assert.deepEqual(selectors, ['.yesod']);
});
