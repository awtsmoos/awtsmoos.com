// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AutoScrollSemanticStorage.test.mjs
 * @description
 * The Awtsmoos proves that slow means slow and remembered intention survives migration;
 * at Awtsmoos.com obsolete defaults soften, while chosen pace keeps its revelation.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	DEFAULT_SEMANTIC_PREFERENCES,
	LPM_UNIT,
	WPM_UNIT,
	clampPaceValue
} from '../autoScroll/SemanticPacePolicy.js';
import {
	AUTO_SCROLL_PREFERENCES_KEY,
	PREVIOUS_AUTO_SCROLL_PREFERENCES_KEY,
	readAutoScrollPreferences
} from '../autoScroll/AutoScrollStorage.js';

class MemoryStorage {
	constructor(entries = {}) {
		this.values = new Map(Object.entries(entries));
	}

	getItem(key) {
		return this.values.has(key) ? this.values.get(key) : null;
	}

	setItem(key, value) {
		this.values.set(key, String(value));
	}

	removeItem(key) {
		this.values.delete(key);
	}
}

test('default semantic pace is calm and the floors are genuinely slow', () => {
	assert.deepEqual(DEFAULT_SEMANTIC_PREFERENCES, {
		unit: WPM_UNIT,
		value: 45,
		preset: 'contemplate',
		eyeLine: 0.4
	});
	assert.equal(clampPaceValue(-50, WPM_UNIT), 10);
	assert.equal(clampPaceValue(-50, LPM_UNIT), 0.25);
});

test('untouched v3 Learn default migrates to contemplation in v4', () => {
	const storage = new MemoryStorage({
		[PREVIOUS_AUTO_SCROLL_PREFERENCES_KEY]: JSON.stringify({
			unit: 'wpm',
			value: 120,
			preset: 'learn',
			eyeLine: 0.4
		})
	});
	const preferences = readAutoScrollPreferences(storage);
	assert.deepEqual(preferences, DEFAULT_SEMANTIC_PREFERENCES);
	assert.deepEqual(
		JSON.parse(storage.getItem(AUTO_SCROLL_PREFERENCES_KEY)),
		DEFAULT_SEMANTIC_PREFERENCES
	);
});

test('custom v3 pace survives migration unchanged', () => {
	const custom = { unit: 'wpm', value: 72, preset: 'custom', eyeLine: 0.5 };
	const storage = new MemoryStorage({
		[PREVIOUS_AUTO_SCROLL_PREFERENCES_KEY]: JSON.stringify(custom)
	});
	assert.deepEqual(readAutoScrollPreferences(storage), custom);
	assert.deepEqual(JSON.parse(storage.getItem(AUTO_SCROLL_PREFERENCES_KEY)), custom);
});
