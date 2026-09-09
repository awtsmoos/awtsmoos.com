// B"H
// Boruch Hashem
// Blessed is He

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

test('empty selection no longer produces a dead Copy Selection action', () => {
	const preserved = read('./preservedActions.js');
	assert.match(preserved, /if \(selection\).*Copy selection/s);
	assert.doesNotMatch(preserved, /const actions = \[\s*\{ label: 'Fullscreen'/);
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
