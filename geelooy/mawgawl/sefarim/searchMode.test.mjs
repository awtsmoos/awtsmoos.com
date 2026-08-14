// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file searchMode.test.mjs
 * @description
 * The Awtsmoos proves Hebrew receives the fast exact lane without overriding deliberate human intent;
 * at Awtsmoos.com broad library reading and exact Tanach remain two clear vessels of one search ascent.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
	automaticMode,
	containsHebrew,
	hasExplicitMode,
	LIBRARY_MODE,
	modeFromUrl,
	TANACH_MODE
} from './searchMode.js';

test('Hebrew automatically selects exact Tanach while English stays library', () => {
	assert.equal(containsHebrew('בראשית'), true);
	assert.equal(containsHebrew('what is creation'), false);
	assert.equal(automaticMode('בראשית'), TANACH_MODE);
	assert.equal(automaticMode('creation'), LIBRARY_MODE);
});

test('URL hydration respects explicit mode before automatic detection', () => {
	assert.equal(modeFromUrl(new URLSearchParams('q=בראשית')), TANACH_MODE);
	assert.equal(modeFromUrl(new URLSearchParams('q=בראשית&mode=library')), LIBRARY_MODE);
	assert.equal(modeFromUrl(new URLSearchParams('q=creation&mode=tanach')), TANACH_MODE);
	assert.equal(hasExplicitMode(new URLSearchParams('q=בראשית')), false);
	assert.equal(hasExplicitMode(new URLSearchParams('q=בראשית&mode=library')), true);
});

test('Tanach browser requests exact mode and result links open safely', () => {
	const api = readFileSync(new URL('./tanachApi.js', import.meta.url), 'utf8');
	const view = readFileSync(new URL('./tanachView.js', import.meta.url), 'utf8');
	assert.match(api, /exact:\s*['"]true['"]/);
	assert.match(view, /target = ['"]_blank['"]/);
	assert.match(view, /noopener noreferrer/);
	assert.match(view, /Open exact verse/);
});
