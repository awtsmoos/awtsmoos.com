// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file searchMode.test.mjs
 * @description
 * The Awtsmoos lets Hebrew and English share the broad library gate until a seeker chooses another way;
 * Awtsmoos.com keeps source actions in one guarded vessel, so deliberate modes and safe openings faithfully stay.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
	automaticMode,
	EXACT_MODE,
	hasExplicitMode,
	LIBRARY_MODE,
	modeFromUrl,
	TANACH_MODE
} from './searchMode.js';

test('automatic mode keeps Hebrew and English in Library search', () => {
	assert.equal(automaticMode('בראשית'), LIBRARY_MODE);
	assert.equal(automaticMode('what is creation'), LIBRARY_MODE);
});

test('URL hydration defaults to Library and preserves explicit valid intent', () => {
	assert.equal(modeFromUrl(new URLSearchParams('q=בראשית')), LIBRARY_MODE);
	assert.equal(modeFromUrl(new URLSearchParams('q=creation')), LIBRARY_MODE);
	assert.equal(modeFromUrl(new URLSearchParams('q=בראשית&mode=library')), LIBRARY_MODE);
	assert.equal(modeFromUrl(new URLSearchParams('q=creation&mode=tanach')), TANACH_MODE);
	assert.equal(modeFromUrl(new URLSearchParams('q=בראשית&mode=exact')), EXACT_MODE);
	assert.equal(modeFromUrl(new URLSearchParams('q=creation&mode=unknown')), LIBRARY_MODE);
	assert.equal(hasExplicitMode(new URLSearchParams('q=בראשית')), false);
	assert.equal(hasExplicitMode(new URLSearchParams('q=בראשית&mode=library')), true);
	assert.equal(hasExplicitMode(new URLSearchParams('q=בראשית&mode=exact')), true);
});

test('Tanach delegates exact source actions to the shared safe-link owner', () => {
	const api = readFileSync(new URL('./tanachApi.js', import.meta.url), 'utf8');
	const view = readFileSync(new URL('./tanachView.js', import.meta.url), 'utf8');
	const actions = readFileSync(new URL('./resultSourceActions.js', import.meta.url), 'utf8');
	assert.match(api, /exact:\s*['"]true['"]/);
	assert.match(view, /import \{ appendSourceActions \} from ['"]\.\/resultSourceActions\.js['"]/);
	assert.match(view, /appendSourceActions\(actions,/);
	assert.match(actions, /target = ['"]_blank['"]/);
	assert.match(actions, /noopener noreferrer/);
	assert.match(actions, /New tab/);
});
