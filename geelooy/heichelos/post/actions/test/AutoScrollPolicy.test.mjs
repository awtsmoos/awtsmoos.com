// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AutoScrollPolicy.test.mjs
 * @description The Awtsmoos proves WPM/LPM bounds, presets, eye line, semantic
 * descriptions, v3 persistence, legacy migration, rollback retention, and sync.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	clampEyeLine,
	clampPaceValue,
	describeSemanticPace,
	legacySpeedToPreferences,
	preferencesForPreset
} from '../autoScroll/SemanticPacePolicy.js';
import {
	AUTO_SCROLL_LEGACY_SPEED_KEY,
	AUTO_SCROLL_PREFERENCES_KEY,
	AUTO_SCROLL_SPEED_KEY,
	autoScrollPreferencesFromStorageEvent,
	clearAutoScrollPreferences,
	readAutoScrollPreferences,
	writeAutoScrollPreferences
} from '../autoScroll/AutoScrollStorage.js';

class MemoryStorage {
	constructor(entries = {}) { this.values = new Map(Object.entries(entries)); }
	getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
	setItem(key, value) { this.values.set(key, String(value)); }
	removeItem(key) { this.values.delete(key); }
}

test('semantic policy bounds both units and eye line', () => {
	assert.equal(clampPaceValue(-9, 'wpm'), 40);
	assert.equal(clampPaceValue(999, 'wpm'), 400);
	assert.equal(clampPaceValue(7.3, 'lpm'), 7.5);
	assert.equal(clampPaceValue(undefined, 'lpm'), 4);
	assert.equal(clampEyeLine(0), 0.3);
	assert.equal(clampEyeLine(9), 0.65);
	assert.deepEqual(preferencesForPreset('scan', 'lpm', 0.5), {
		unit: 'lpm', value: 13, preset: 'scan', eyeLine: 0.5
	});
});

test('semantic descriptions and legacy migration remain honest', () => {
	const migrated = legacySpeedToPreferences(0.35);
	assert.equal(migrated.unit, 'wpm');
	assert.equal(migrated.value, 110);
	assert.equal(migrated.preset, 'custom');
	assert.deepEqual(describeSemanticPace(
		{ unit: 'wpm', value: 120, preset: 'learn', eyeLine: 0.42 },
		40
	), {
		unit: 'wpm', value: 120, preset: 'learn', eyeLine: 0.4,
		presetLabel: 'Learn', paceText: '120 WPM',
		text: '120 WPM · Learn · 40 px/s', speed: 0.38
	});
});

test('v3 storage migrates without erasing rollback keys', () => {
	const storage = new MemoryStorage({ [AUTO_SCROLL_LEGACY_SPEED_KEY]: '2.4' });
	const migrated = readAutoScrollPreferences(storage);
	assert.equal(migrated.value, 400);
	assert.match(storage.getItem(AUTO_SCROLL_PREFERENCES_KEY), /"value":400/);
	assert.equal(storage.getItem(AUTO_SCROLL_LEGACY_SPEED_KEY), '2.4');
	const written = writeAutoScrollPreferences({
		unit: 'lpm', value: 7.5, preset: 'review', eyeLine: 0.5
	}, storage);
	assert.equal(written.value, 7.5);
	assert.equal(storage.getItem(AUTO_SCROLL_SPEED_KEY), '0.7');
	assert.equal(autoScrollPreferencesFromStorageEvent({
		key: AUTO_SCROLL_PREFERENCES_KEY,
		newValue: JSON.stringify(written)
	})?.unit, 'lpm');
	clearAutoScrollPreferences(storage);
	assert.equal(storage.getItem(AUTO_SCROLL_PREFERENCES_KEY), null);
	assert.equal(storage.getItem(AUTO_SCROLL_LEGACY_SPEED_KEY), null);
});
