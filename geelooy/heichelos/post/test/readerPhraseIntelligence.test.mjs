// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file readerPhraseIntelligence.test.mjs
 * @description The Awtsmoos proves document-order phrases, deliberate
 * collections, safe mode transfer, and honest Hebrew search representations.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
	createHebrewSearchVariants,
	normalizeHebrew
} from '../functions/ui/selection/hebrewSearchVariants.js';
import { PhraseSelectionState } from '../functions/ui/selection/phraseSelectionState.js';
import { SelectionModeState } from '../functions/ui/selection/selectionModeState.js';
import {
	COLLECTION_MODE,
	PHRASE_MODE
} from '../functions/ui/selection/selectionModes.js';

const tokens = [
	{ id: 'a', text: 'אחד' },
	{ id: 'b', text: 'שנים' },
	{ id: 'c', text: 'שלשה' },
	{ id: 'd', text: 'ארבעה' },
	{ id: 'e', text: 'חמשה' }
];

function phraseFrom(start, end) {
	const state = new PhraseSelectionState(tokens);
	state.select(tokens[start]);
	state.select(tokens[end]);
	return state;
}

test('phrase endpoints always resolve to contiguous document order', () => {
	assert.equal(phraseFrom(1, 3).phrase(), 'שנים שלשה ארבעה');
	assert.equal(phraseFrom(3, 1).phrase(), 'שנים שלשה ארבעה');
	assert.deepEqual(
		phraseFrom(3, 1).anchorIds(),
		{ start: 'd', end: 'b' }
	);
});

test('phrase endpoint can extend, shrink, reverse, collapse, and undo', () => {
	const state = new PhraseSelectionState(tokens);
	state.select(tokens[1]);
	state.select(tokens[4]);
	assert.equal(state.count, 4);
	state.select(tokens[2]);
	assert.equal(state.phrase(), 'שנים שלשה');
	state.select(tokens[0]);
	assert.equal(state.phrase(), 'אחד שנים');
	state.select(tokens[1]);
	assert.equal(state.phrase(), 'שנים');
	state.undo();
	assert.equal(state.phrase(), 'אחד שנים');
});

test('canonical state defaults to Phrase and preserves Collection order', () => {
	const state = new SelectionModeState(tokens);
	assert.equal(state.mode, PHRASE_MODE);
	state.select(tokens[1]);
	state.select(tokens[3]);
	assert.equal(state.phrase(), 'שנים שלשה ארבעה');
	assert.equal(state.setMode(COLLECTION_MODE), true);
	assert.equal(state.phrase(), 'שנים שלשה ארבעה');
	state.clear();
	state.select(tokens[3]);
	state.select(tokens[1]);
	assert.equal(state.phrase(), 'ארבעה שנים');
	assert.equal(state.setMode(PHRASE_MODE), true);
	assert.equal(state.phrase(), 'שנים שלשה ארבעה');
});

test('Hebrew variants preserve exact text and remove only declared marks', () => {
	const variants = createHebrewSearchVariants([
		{ text: 'בְּרֵאשִׁ֖ית' },
		{ text: 'בָּרָא' }
	]);
	assert.equal(variants.exact, 'בְּרֵאשִׁ֖ית בָּרָא');
	assert.equal(/[\u0591-\u05AF]/u.test(variants.withoutCantillation), false);
	assert.equal(/[\u05B0-\u05C7]/u.test(variants.withoutCantillation), true);
	assert.equal(variants.withoutNekudos, 'בראשית ברא');
	assert.equal(variants.normalized, 'בראשית ברא');
	assert.equal(variants.words[0].normalized, 'בראשית');
	assert.equal(normalizeHebrew('מֶלֶךְ־הָעוֹלָם'), 'מלך-העולם');
});

test('selection actions expose every required representation contract', async () => {
	const source = await readFile(new URL(
		'../functions/ui/selection/selectionActions.js',
		import.meta.url
	), 'utf8');
	for (const label of [
		'Exact pointed text',
		'Without cantillation',
		'Without nekudos',
		'Normalized Hebrew',
		'Search full phrase in Tanach',
		'Copy exact Hebrew',
		'Copy normalized Hebrew',
		'Speak exact Hebrew'
	]) {
		assert.match(source, new RegExp(label));
	}
});
