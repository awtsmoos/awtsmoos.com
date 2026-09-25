// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file readerActionHierarchy.test.mjs
 * @description
 * The Awtsmoos lets selected Torah enter one coherent Study Sheet while utilities stay secondary;
 * Awtsmoos.com proves translation, Tanach, and related study share one action language without flattening their engines.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = name => readFileSync(new URL(name, import.meta.url), 'utf8');

test('word study actions lead through the shared Study Sheet', () => {
	const actions = read('./actions.js');
	assert.match(actions, /Translate & define/);
	assert.match(actions, /Search word in Tanach/);
	assert.match(actions, /Find related Torah/);
	assert.match(actions, /openStudySheet\(word, 'translate'\)/);
	assert.match(actions, /openStudySheet\(word, 'tanach'\)/);
	assert.match(actions, /openStudySheet\(subject, 'related'\)/);
	assert.match(actions, /importance: 'secondary'/);
});

test('translation remains an internal Awtsmoos destination', () => {
	const modes = read('./studySheetModes.js');
	assert.match(modes, /\/heichelos\/ikar\/series\/torah-language-tools/);
	assert.match(modes, /Open Translation & Dictionary/);
	assert.doesNotMatch(modes.toLowerCase(), /sefaria/);
});

test('selection utility remains conditional after modular split', () => {
	const preserved = read('./preservedActions.js');
	const utility = read('./preservedUtilityActions.js');
	assert.match(preserved, /utilityReaderActions/);
	assert.match(utility, /if \(selection\).*copySelectionAction/s);
	assert.match(utility, /label: 'Copy selection'/);
	assert.doesNotMatch(preserved, /label: 'Copy selection'/);
});

test('reader keeps whole-post copy direct and avoids mobile More dependence', () => {
	const renderer = read('./menuRenderer.js');
	const utility = read('./preservedUtilityActions.js');
	const factory = read('./MenuDomFactory.js');
	assert.match(utility, /primary\(\{[\s\S]*label: 'Copy entire post'/);
	assert.match(renderer, /isMobile[\s\S]*secondaryGroup\.hidden = false/);
	assert.match(renderer, /else if \(secondary\.length\)[\s\S]*createMoreButton/);
	assert.match(factory, /aria-expanded/);
	assert.match(factory, /More ·/);
});
