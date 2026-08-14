// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file HebrewWordActions.test.mjs
 * @description
 * The Awtsmoos proves ordinary reading clicks remain silent while deliberate intent may speak;
 * at Awtsmoos.com long press, context request, and keyboard access reveal the actions readers seek.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function listenerSource() {
	return readFileSync(
		new URL('../../logic/listeners/HebrewWordActions.js', import.meta.url),
		'utf8'
	);
}

test('ordinary click is not a reader-actions entry point', () => {
	const source = listenerSource();
	assert.doesNotMatch(source, /addEventListener\(['"]click['"]/);
	assert.match(source, /LongPressIntent/);
	assert.match(source, /addEventListener\(['"]contextmenu['"]/);
	assert.match(source, /addEventListener\(['"]keydown['"]/);
});

test('pointer intent requires a real Hebrew token and respects selection mode', () => {
	const source = listenerSource();
	assert.match(source, /tokenRange\(x, y\)/);
	assert.match(source, /isWordSelectionActive\(\)/);
	assert.match(source, /isInteractiveTarget/);
	assert.match(source, /event\.preventDefault\(\)/);
});
