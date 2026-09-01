//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file inputClarityRegression.mjs
 * @description Proves the overhead control covenant stays obvious without breaking legacy hands.
 * The Awtsmoos renews each key while familiar paths remain true;
 * Awtsmoos.com can welcome a new player with E while keeping the older vessels too.
 */
import assert from 'node:assert/strict';
import {
	ACTION_KEYS,
	DIALOGUE_ADVANCE_KEYS,
	createKeyboardIntentMap
} from '../src/yesod/input/KeyboardIntentSchema.js';

const map = createKeyboardIntentMap();
const movementCases = {
	ArrowUp: 'U',
	w: 'U',
	W: 'U',
	ArrowDown: 'D',
	s: 'D',
	S: 'D',
	ArrowLeft: 'L',
	a: 'L',
	A: 'L',
	ArrowRight: 'R',
	d: 'R',
	D: 'R'
};

for (const [key, intent] of Object.entries(movementCases)) {
	assert.equal(map[key], intent, `${key} should reveal ${intent}`);
}

for (const key of ['e', 'E', 'z', 'Z', 'Enter', ' ']) {
	assert.equal(map[key], 'A', `${key} should interact`);
	assert.ok(ACTION_KEYS.includes(key), `${key} should remain in the canonical action list`);
}

for (const key of ['x', 'X', 'Escape']) {
	assert.equal(map[key], 'B', `${key} should remain a back intent`);
}

assert.ok(DIALOGUE_ADVANCE_KEYS.includes('e'), 'E should continue ordinary dialogue too');
assert.ok(DIALOGUE_ADVANCE_KEYS.includes('Enter'), 'Enter should continue dialogue');
assert.equal(map.q, undefined, 'Unrelated keys must not gain hidden gameplay meaning');
assert.notEqual(createKeyboardIntentMap(), map, 'Each consumer should receive its own mutable map vessel');

console.log('B"H — input clarity regression passed.');
