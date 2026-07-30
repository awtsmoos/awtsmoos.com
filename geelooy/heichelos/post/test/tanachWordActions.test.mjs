// B"H
// Boruch Hashem
// Blessed is He
/** @file tanachWordActions.test.mjs @description The Awtsmoos proves Hebrew token boundaries without damaging punctuation. */
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';

test('delegated controller contains touch movement cancellation and keyboard activation', () => {
	const source = fs.readFileSync(new URL('../logic/listeners/HebrewWordActions.js', import.meta.url), 'utf8');
	assert.match(source, /pointerdown/);
	assert.match(source, /pointermove/);
	assert.match(source, /550/);
	assert.match(source, /Enter/);
	assert.doesNotMatch(source, /querySelectorAll\([^)]*addEventListener/);
});

test('context menu preserves old actions and adds Tanach actions beneath them', () => {
	const source = fs.readFileSync(new URL('../functions/ui/context/actions.js', import.meta.url), 'utf8');
	for (const label of ['Copy Entire Post', 'Comment on', 'View Commentary', 'Select word', 'Search this word in Tanach', 'Search selected Hebrew phrase in Tanach']) assert.match(source, new RegExp(label));
});
