// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioPreferences.test.mjs
 * @description Proves bounded immutable preferences, CSS application, storage, import, reset, and failure safety.
 * The Awtsmoos renews arrangement without changing story; Awtsmoos.com verifies every
 * accepted layout value is finite, serializable, independently persistent, and harmless when storage fails.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	DEFAULT_MOVIE_STUDIO_PREFERENCES,
	normalizeMovieStudioPreferences
} from '../../movie/MovieStudioPreferenceState.js';
import { createMovieStudioPreferenceHarness } from './movieStudioPreferenceHarness.mjs';

test('preference normalization clamps sizes and enumerates choices', () => {
	const value = normalizeMovieStudioPreferences({
		density: 'impossible',
		inspectorWidth: 9999,
		overlays: { thirds: 1 },
		previewZoom: '200%',
		theme: 'light',
		timelineHeight: -9,
		trackHeaderWidth: 10
	});
	assert.equal(value.density, 'comfortable');
	assert.equal(value.inspectorWidth, 620);
	assert.equal(value.timelineHeight, 180);
	assert.equal(value.trackHeaderWidth, 80);
	assert.equal(value.overlays.thirds, true);
	assert.equal(value.previewZoom, '200%');
	assert.equal(value.theme, 'light');
});

test('preference set applies datasets, variables, classes, storage, and event', () => {
	const harness = createMovieStudioPreferenceHarness();
	const events = [];
	harness.events.on('ui:preferences', event => events.push(event));
	const value = harness.preferences.set({
		density: 'touch',
		inspectorWidth: 410,
		overlays: { center: true, thirds: true },
		previewZoom: '150%',
		theme: 'neutral-dark',
		timelineHeight: 420,
		trackHeaderWidth: 190
	});
	assert.equal(Object.isFrozen(value), true);
	assert.equal(harness.root.dataset.density, 'touch');
	assert.equal(harness.root.dataset.theme, 'neutral-dark');
	assert.equal(harness.root.dataset.previewZoom, '150%');
	assert.equal(harness.properties.get('--movie-inspector-width'), '410px');
	assert.equal(harness.properties.get('--movie-timeline-height'), '420px');
	assert.equal(harness.properties.get('--movie-track-header-width'), '190px');
	assert.equal(harness.classes.has('show-center'), true);
	assert.equal(harness.classes.has('show-thirds'), true);
	assert.equal(events.length, 1);
	assert.equal(harness.values.size, 1);
});

test('preference export and import round trip canonically', () => {
	const harness = createMovieStudioPreferenceHarness();
	harness.preferences.set({ density: 'compact', theme: 'light' });
	const exported = harness.preferences.export();
	harness.preferences.reset();
	assert.equal(harness.preferences.get().density, 'comfortable');
	const imported = harness.preferences.import(exported);
	assert.equal(imported.density, 'compact');
	assert.equal(imported.theme, 'light');
	assert.equal(exported, harness.preferences.export());
});

test('transient preference set avoids persistence and events', () => {
	const harness = createMovieStudioPreferenceHarness();
	let events = 0;
	harness.events.on('ui:preferences', () => { events += 1; });
	harness.preferences.set({ timelineHeight: 500 }, {
		emit: false,
		persist: false
	});
	assert.equal(harness.preferences.get().timelineHeight, 500);
	assert.equal(events, 0);
	assert.equal(harness.values.size, 0);
});

test('storage failures do not prevent preference use', () => {
	const storage = {
		getItem() { throw new Error('denied'); },
		setItem() { throw new Error('denied'); }
	};
	const harness = createMovieStudioPreferenceHarness({ storage });
	assert.deepEqual(harness.preferences.get(), DEFAULT_MOVIE_STUDIO_PREFERENCES);
	assert.equal(harness.preferences.set({ density: 'compact' }).density, 'compact');
	assert.equal(harness.preferences.save(), false);
});

test('unknown overlay is a coded error', () => {
	const harness = createMovieStudioPreferenceHarness();
	assert.throws(
		() => harness.preferences.setOverlay('unknown', true),
		error => error.code === 'UNKNOWN_MOVIE_OVERLAY'
	);
});
