// B"H
// Boruch Hashem
// Blessed is He

/** @file actionBarPersistence.test.mjs @description Verifies compact action-bar reloads and cleanup. */

import assert from 'node:assert/strict';
import test from 'node:test';
import { ActionBarPersistence } from '../../gameplay/actionbar/ActionBarPersistence.js';
import { ActionBarStore } from '../../gameplay/actionbar/ActionBarStore.js';

test('layout persists on mutation, restores on reload, and disconnects cleanly', () => {
	const storage = memoryStorage();
	const firstStore = new ActionBarStore();
	const firstPersistence = new ActionBarPersistence({ key: 'test.action-bar', storage });
	firstPersistence.connect(firstStore);
	firstStore.assign(0, 'light-of-clarity');
	firstStore.setRows(2);
	assert.equal(firstPersistence.snapshot().writes, 2);
	firstPersistence.destroy();
	firstStore.assign(1, 'shield-of-trust');
	assert.equal(firstPersistence.snapshot().writes, 2);

	const restoredStore = new ActionBarStore();
	const restoredPersistence = new ActionBarPersistence({ key: 'test.action-bar', storage });
	restoredPersistence.connect(restoredStore);
	assert.equal(restoredStore.snapshot().slots[0], 'light-of-clarity');
	assert.equal(restoredStore.snapshot().slots[1], null);
	assert.equal(restoredStore.snapshot().rows, 2);
	assert.equal(restoredPersistence.snapshot().restored, true);
	restoredPersistence.destroy();
});

test('malformed storage is ignored and reported', () => {
	const storage = memoryStorage();
	storage.setItem('broken.action-bar', '{');
	const persistence = new ActionBarPersistence({ key: 'broken.action-bar', storage });
	const store = new ActionBarStore();
	persistence.connect(store);
	assert.equal(persistence.snapshot().failures, 1);
	assert.equal(store.snapshot().slots.every(slot => slot === null), true);
	persistence.destroy();
});

function memoryStorage() {
	const values = new Map();
	return {
		getItem: key => values.get(key) ?? null,
		removeItem: key => values.delete(key),
		setItem: (key, value) => values.set(key, value)
	};
}
