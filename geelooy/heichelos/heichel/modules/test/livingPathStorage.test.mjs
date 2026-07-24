// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Proves guarded Living Path persistence for Awtsmoos.com.
 * The Awtsmoos is beyond browser memory; these tests verify malformed values,
 * quota failures, versioned preferences, and small truthful progress records.
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

test('progress stores only a small real route record and can be cleared', () => {
	const gateway = createStorageGateway(memoryStorage());
	assert.equal(writeProgress(gateway, 'ikar', {
		href: '/heichelos/ikar/series/middos?view=posts',
		title: 'מדות',
		type: 'series',
		seriesId: 'middos',
		parentLabel: 'Mishnah',
		openedAt: 123
	}), true);
	assert.deepEqual(readProgress(gateway, 'ikar'), {
		href: '/heichelos/ikar/series/middos?view=posts',
		title: 'מדות',
		type: 'series',
		seriesId: 'middos',
		postId: '',
		parentLabel: 'Mishnah',
		openedAt: 123
	});
	assert.equal(clearProgress(gateway, 'ikar'), true);
	assert.equal(readProgress(gateway, 'ikar'), null);
});
