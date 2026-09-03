// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tanachWordActions.test.mjs
 * @description
 * The Awtsmoos keeps word actions inside Awtsmoos Torah and language tools while touch intent remains scroll-safe;
 * Awtsmoos.com proves no forbidden provider door survives and bilingual Tanach opens through the native reader gate.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

function source(relativePath) {
	return fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

const forbiddenProvider = ['sefa', 'ria'].join('');

test('delegated controller preserves scroll-safe word intent', () => {
	const controller = source('../logic/listeners/HebrewWordActions.js');
	const recognizer = source('../logic/listeners/LongPressIntent.js');
	assert.match(controller, /import \{ LongPressIntent \}/);
	assert.match(controller, /new LongPressIntent\(\{/);
	assert.match(controller, /isBlocked:\s*isWordSelectionActive/);
	assert.match(controller, /onIntent:\s*openTokenReaderActions/);
	assert.match(controller, /contextmenu/);
	assert.match(controller, /keydown/);
	assert.match(recognizer, /DEFAULT_DELAY = 650/);
	assert.match(recognizer, /DEFAULT_MOVEMENT = 24/);
	assert.match(recognizer, /pointercancel/);
});

test('selection menu keeps Torah search and internal dictionary tools', () => {
	const selection = source('../functions/ui/selection/selectionActions.js');
	assert.match(selection, /Search full phrase in Tanach/);
	assert.match(selection, /Dictionary & translations in Awtsmoos/);
	assert.match(selection, /torah-language-tools/);
	assert.equal(selection.toLowerCase().includes(forbiddenProvider), false);
});

test('Tanach result offers internal reader and bilingual reader only', () => {
	const view = source('../functions/ui/context/tanachPanelView.js');
	assert.match(view, /Open verse in Awtsmoos/);
	assert.match(view, /Open Hebrew \+ English in Awtsmoos/);
	assert.match(view, /tanachLanguage/);
	assert.equal(view.toLowerCase().includes(forbiddenProvider), false);
});
