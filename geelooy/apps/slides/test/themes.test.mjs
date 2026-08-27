//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file themes.test.mjs
 * @description The Awtsmoos lets a deck change garments without losing its content; Awtsmoos.com verifies that themes resolve into canonical data and unknown garments return to a known vessel.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from '../src/model/ElementFactory.js';
import { createPresentation } from '../src/model/PresentationDocument.js';
import {
	applyPresentationTheme,
	safeThemeId
} from '../src/model/PresentationThemes.js';

test('theme application resolves presentation colors into deck data', () => {
	const deck = createPresentation('Theme deck');
	deck.slides[0].elements.push(createElement('shape'));
	applyPresentationTheme(deck, 'dawn');
	const [heading, body, shape] = deck.slides[0].elements;
	assert.equal(deck.themeId, 'dawn');
	assert.equal(deck.slides[0].background, '#fff8ed');
	assert.equal(heading.color, '#30271f');
	assert.equal(body.color, '#65584c');
	assert.equal(shape.fill, '#e98452');
});

test('unknown theme identity falls back to midnight', () => {
	assert.equal(safeThemeId('unknown-theme'), 'midnight');
	const deck = createPresentation('Safe theme');
	applyPresentationTheme(deck, 'javascript:evil');
	assert.equal(deck.themeId, 'midnight');
	assert.equal(deck.slides[0].background, '#11121a');
});
