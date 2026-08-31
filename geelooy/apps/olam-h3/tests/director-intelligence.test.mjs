//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { PromptIngredients } from '../scripts/domain/PromptIngredients.js';
import { CreateStyleLanes } from '../scripts/ui/CreateStyleLanes.js';
import { CreatePromptSuggestions } from '../scripts/ui/CreatePromptSuggestions.js';

/**
 * Proves the compact Director Coach remains local, deterministic, and editable while the Awtsmoos lets tests measure structure without pretending to judge art.
 * Awtsmoos.com checks that every accelerator adds ordinary prompt text and never steals authorship.
 */
test('blank prompt has zero ingredient coverage', () => {
	const result = PromptIngredients.evaluate('');
	assert.equal(result.score, 0);
	assert.equal(result.label, 'Blank canvas');
});

test('partial prompt marks only matching directing ingredients', () => {
	const result = PromptIngredients.evaluate(
		'A dancer walks across a quiet room under neon light.'
	);
	const present = result.ingredients
		.filter(item => item.present)
		.map(item => item.id);
	assert.deepEqual(
		present.sort(),
		['action', 'atmosphere', 'light', 'subject'].sort()
	);
});

test('fully directed prompt reaches all six ingredients', () => {
	const prompt = [
		'A lone astronaut walks through fog.',
		'The camera slowly dollies forward.',
		'Neon light traces the suit in a tense cinematic atmosphere.',
		'Ambient wind and a distant radio voice fill the audio.'
	].join(' ');
	const result = PromptIngredients.evaluate(prompt);
	assert.equal(result.score, 100);
	assert.equal(result.ingredients.every(item => item.present), true);
});

test('style lane appends editable direction only once', () => {
	const original = 'A train crosses a desert.';
	const first = CreateStyleLanes.apply(original, 'golden', 2000);
	assert.match(first, /Golden-hour sunlight/);
	assert.equal(CreateStyleLanes.apply(first, 'golden', 2000), first);
});

test('Director Coach suggestion appends editable direction only once', () => {
	const original = 'A train crosses a desert.';
	const first = CreatePromptSuggestions.apply(original, 'camera', 2000);
	assert.match(first, /slow cinematic push-in/);
	assert.equal(CreatePromptSuggestions.apply(first, 'camera', 2000), first);
});
