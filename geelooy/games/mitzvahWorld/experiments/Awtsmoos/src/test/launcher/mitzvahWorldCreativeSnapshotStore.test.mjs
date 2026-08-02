// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	clearMitzvahWorldCreativeSnapshot,
	readMitzvahWorldCreativeSnapshot,
	writeMitzvahWorldCreativeSnapshot
} from '../../launcher/MitzvahWorldCreativeSnapshotStore.js';

class MemoryStorage {
	constructor() { this.values = new Map(); }
	getItem(key) { return this.values.get(key) ?? null; }
	setItem(key, value) { this.values.set(key, String(value)); }
	removeItem(key) { this.values.delete(key); }
}

const snapshot = {
	format: 'awtsmoos.mitzvah-world.capture.v1',
	capturedAt: '2026-08-02T20:00:00.000Z',
	source: {
		href: '/games/mitzvahWorld/?session=solo',
		returnHref: '/games/mitzvahWorld/?session=solo',
		sessionMode: 'single',
		title: 'Mitzvah World'
	}
};

test('creative snapshot store writes, reads, and clears validated captures', () => {
	const storage = new MemoryStorage();
	assert.equal(writeMitzvahWorldCreativeSnapshot(snapshot, storage).ok, true);
	assert.deepEqual(readMitzvahWorldCreativeSnapshot(storage).snapshot, snapshot);
	assert.equal(clearMitzvahWorldCreativeSnapshot(storage).ok, true);
	assert.equal(readMitzvahWorldCreativeSnapshot(storage).code, 'CAPTURE_NOT_FOUND');
});

test('creative snapshot store rejects corrupt JSON without throwing', () => {
	const storage = new MemoryStorage();
	storage.setItem('awtsmoos.mitzvah-world.capture.current', '{broken');
	const result = readMitzvahWorldCreativeSnapshot(storage);
	assert.equal(result.ok, false);
	assert.equal(result.code, 'STORAGE_READ_FAILED');
});
