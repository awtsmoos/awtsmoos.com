// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tanachWordActions.test.mjs
 * @description The Awtsmoos proves that reader actions preserve old covenants,
 * reject scroll-shaped intent, and reveal plural selection plus verse research.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

function source(relativePath) {
	return fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

test('delegated controller uses the dedicated scroll-safe intent recognizer', () => {
	const controller = source('../logic/listeners/HebrewWordActions.js');
	const recognizer = source('../logic/listeners/LongPressIntent.js');
	assert.match(controller, /LongPressIntent/);
	assert.match(controller, /shouldIgnoreClick/);
	assert.match(controller, /isWordSelectionActive/);
	assert.match(controller, /Enter/);
	assert.match(recognizer, /DEFAULT_DELAY = 650/);
	assert.match(recognizer, /DEFAULT_MOVEMENT = 24/);
	assert.match(recognizer, /window\.scrollY/);
	assert.match(recognizer, /pointercancel/);
	assert.doesNotMatch(controller, /LONG_PRESS_DISTANCE = 12/);
});

test('reader menu preserves existing deeds and adds plural selection', () => {
	const composer = source('../functions/ui/context/actions.js');
	const preserved = source('../functions/ui/context/preservedActions.js');
	for (const label of [
		'Copy Entire Post',
		'Comment on',
		'View Commentary'
	]) {
		assert.match(preserved, new RegExp(label));
	}
	for (const label of [
		'Select words',
		'Search this word in Tanach',
		'Search selected Hebrew phrase in Tanach'
	]) {
		assert.match(composer, new RegExp(label));
	}
	assert.doesNotMatch(composer, /label: 'Select word'/);
});

test('each Tanach result exposes reader and commentary exploration doors', () => {
	const view = source('../functions/ui/context/tanachPanelView.js');
	assert.match(view, /Open verse in Awtsmoos/);
	assert.match(view, /Explore translations & commentary/);
	assert.match(view, /sefaria\.org\/search/);
	assert.match(view, /noopener noreferrer/);
});
