// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file readerActionHierarchy.test.mjs
 * @description Guards the split reader-action hierarchy so study deeds lead
 * while global utilities remain secondary and selection actions stay conditional.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = name => readFileSync(new URL(name, import.meta.url), 'utf8');

test('word study actions lead while utility actions are explicitly secondary', () => {
	const actions = read('./actions.js');
	assert.match(actions, /Define this word/);
	assert.match(actions, /Search this word in Tanach/);
	assert.match(actions, /Find related sources/);
	assert.match(actions, /importance: 'secondary'/);
	assert.match(actions, /torah-language-tools/);
});

test('selection utility remains conditional after modular split', () => {
	const preserved = read('./preservedActions.js');
	const utility = read('./preservedUtilityActions.js');
	assert.match(preserved, /utilityReaderActions/);
	assert.match(utility, /if \(selection\).*copySelectionAction/s);
	assert.match(utility, /label: 'Copy selection'/);
	assert.doesNotMatch(preserved, /label: 'Copy selection'/);
});

test('reader renderer owns a real More disclosure for secondary actions', () => {
	const renderer = read('./menuRenderer.js');
	const factory = read('./MenuDomFactory.js');
	assert.match(renderer, /partition\(actions\)/);
	assert.match(renderer, /createMoreButton/);
	assert.match(renderer, /secondaryGroup\.hidden/);
	assert.match(factory, /aria-expanded/);
	assert.match(factory, /More ·/);
});
