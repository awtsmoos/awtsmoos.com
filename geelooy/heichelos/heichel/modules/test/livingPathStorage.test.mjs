// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Proves guarded Living Path persistence for Awtsmoos.com.
 * The Awtsmoos is beyond browser memory, yet each remembered path may carry distinct vessels of Hebrew and English light;
 * these tests keep storage small, stable-ID based, backward compatible, and truthful through every renewed browser night.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createStorageGateway } from '../living-path/storage-gateway.js';
import {
	PREFERENCE_KEY,
	readPreferences,
	writePreferences
} from '../living-path/preference-store.js';
import {
	clearProgress,
	readProgress,
	writeProgress
} from '../living-path/progress-store.js';

function memoryStorage(initial = {}) {
	const records = new Map(Object.entries(initial));
	return {
		getItem: key => records.has(key) ? records.get(key) : null,
		setItem: (key, value) => records.set(key, value),
		removeItem: key => records.delete(key),
		records
	};
}

test('storage gateway returns fallbacks for malformed JSON and write failures', () => {
	const malformed = createStorageGateway(memoryStorage({ broken: '{nope' }));
	assert.deepEqual(malformed.read('broken', { safe: true }), { safe: true });
	const failing = createStorageGateway({
		getItem() { throw new Error('private'); },
		setItem() { throw new Error('quota'); },
		removeItem() { throw new Error('private'); }
	});
	assert.equal(failing.read('x', 'fallback'), 'fallback');
	assert.equal(failing.write('x', {}), false);
	assert.equal(failing.remove('x'), false);
});

test('preferences normalize durable density, scope, and filters', () => {
	const storage = memoryStorage();
	const gateway = createStorageGateway(storage);
	assert.equal(writePreferences(gateway, {
		density: 'compact',
		searchScope: 'currentView',
		committedFilters: { kinds: ['audio'], language: 'he', sort: 'oldest' }
	}), true);
	assert.ok(storage.records.has(PREFERENCE_KEY));
	assert.deepEqual(readPreferences(gateway), {
		density: 'compact',
		searchScope: 'currentView',
		filters: { kinds: ['audio'], language: 'he', sort: 'oldest' }
	});
});

test('progress stores bilingual identity fields beside stable route ids', () => {
	const gateway = createStorageGateway(memoryStorage());
	assert.equal(writeProgress(gateway, 'ikar', {
		href: '/heichelos/ikar/series/middos?view=posts',
		title: 'מדות · Middos',
		titleHe: 'מדות',
		titleEn: 'Middos',
		type: 'series',
		seriesId: 'middos',
		parentSeriesId: 'theOralTorah',
		parentLabel: 'תורה שבעל פה · The Oral Torah',
		openedAt: 123
	}), true);
	assert.deepEqual(readProgress(gateway, 'ikar'), {
		href: '/heichelos/ikar/series/middos?view=posts',
		title: 'מדות · Middos',
		titleHe: 'מדות',
		titleEn: 'Middos',
		type: 'series',
		seriesId: 'middos',
		postId: '',
		parentSeriesId: 'theOralTorah',
		parentLabel: 'תורה שבעל פה · The Oral Torah',
		openedAt: 123
	});
	assert.equal(clearProgress(gateway, 'ikar'), true);
	assert.equal(readProgress(gateway, 'ikar'), null);
});

test('legacy progress with a rendered title remains readable without manual cache clearing', () => {
	const key = 'BH_AWTSMOOS_LIVING_PATH_PROGRESS_V1:ikar';
	const legacy = {
		href: '/heichelos/ikar/series/shoftim',
		title: 'שופטים · Judges',
		type: 'series',
		seriesId: 'shoftim',
		parentLabel: 'נביאים · Prophets',
		openedAt: 321
	};
	const gateway = createStorageGateway(memoryStorage({
		[key]: JSON.stringify(legacy)
	}));
	assert.deepEqual(readProgress(gateway, 'ikar'), legacy);
});
