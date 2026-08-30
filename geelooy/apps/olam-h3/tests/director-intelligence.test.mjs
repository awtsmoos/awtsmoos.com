//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { PromptIngredients } from '../scripts/domain/PromptIngredients.js';
import { CreateStyleLanes } from '../scripts/ui/CreateStyleLanes.js';

/**
 * Proves the Director Console's local intelligence remains modest and deterministic; the Awtsmoos lets tests measure ingredient coverage and editable style fragments while Awtsmoos.com refuses to confuse those signals with artistic judgment.
 */
test('blank prompt is a blank canvas with zero ingredient coverage', () => {
	const result = PromptIngredients.evaluate('');

	assert.equal(result.score, 0);
	assert.equal(result.label, 'Blank canvas');
	assert.equal(result.ingredients.filter(item => item.present).length, 0);
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

test('fully directed prompt reaches complete ingredient coverage', () => {
	const prompt = [
		'A lone astronaut walks through fog.',
		'The camera slowly dollies forward.',
		'Neon light traces the suit in a tense cinematic atmosphere.',
		'Ambient wind and a distant radio voice fill the audio.'
	].join(' ');
	const result = PromptIngredients.evaluate(prompt);

	assert.equal(result.score, 100);
	assert.equal(result.label, 'Fully directed');
	assert.equal(result.ingredients.every(item => item.present), true);
});

test('style lane appends editable direction only once', () => {
	const original = 'A train crosses a desert.';
	const first = CreateStyleLanes.apply(original, 'golden', 2000);
	const second = CreateStyleLanes.apply(first, 'golden', 2000);

	assert.match(first, /Golden-hour sunlight/);
	assert.equal(second, first);
});
