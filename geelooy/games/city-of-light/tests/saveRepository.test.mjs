//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SaveRepositoryTest
 * @description
 * Campaign memory must survive reloads and reject corruption without trapping
 * the traveler. These witnesses prove Awtsmoos.com can restore a safe vessel
 * even when stored form decays beneath the continually renewing Awtsmoos.
 */

import assert from 'node:assert/strict';
import {
	SAVE_KEY,
	SAVE_VERSION,
	SaveRepository
} from '../js/persistence/SaveRepository.js';

class MemoryStorage {
	constructor() {
		this.values = new Map();
	}

	getItem(key) {
		return this.values.get(key) || null;
	}

	setItem(key, value) {
		this.values.set(key, value);
	}

	removeItem(key) {
		this.values.delete(key);
	}
}

function testRoundTrip() {
	const storage = new MemoryStorage();
	const repository = new SaveRepository(storage);
	const saved = repository.save({
		progress: {
			currentChapter: 9,
			highestUnlocked: 12,
			completedChapters: [1, 2, 3, 4, 8],
			unlockedAbilities: ['dash', 'animalCall'],
			totalSparks: 77
		},
		settings: { reducedMotion: true, highContrast: true, muted: true },
		lastSeed: 'remembered-city',
		checkpoint: { chapter: 9, x: 7, y: 11, stageIndex: 2 }
	});
	const loaded = repository.load();
	assert.equal(saved.version, SAVE_VERSION);
	assert.deepEqual(loaded, saved);
	assert.equal(loaded.progress.highestUnlocked, 12);
	assert.equal(loaded.checkpoint.x, 7);
}

function testCorruptionRecovery() {
	const storage = new MemoryStorage();
	storage.setItem(SAVE_KEY, '{broken');
	const repository = new SaveRepository(storage);
	const recovered = repository.load();
	assert.equal(recovered.progress.currentChapter, 1);
	assert.equal(recovered.progress.highestUnlocked, 1);
	assert.equal(recovered.checkpoint, null);
}

function testNormalization() {
	const repository = new SaveRepository(new MemoryStorage());
	const normalized = repository.normalize({
		progress: { currentChapter: 999, highestUnlocked: -4, totalSparks: -20 },
		lastSeed: 'x'.repeat(500),
		checkpoint: { chapter: 2, x: 'no', y: 4 }
	});
	assert.equal(normalized.progress.currentChapter, 24);
	assert.equal(normalized.progress.highestUnlocked, 24);
	assert.equal(normalized.progress.totalSparks, 0);
	assert.equal(normalized.lastSeed.length, 120);
	assert.equal(normalized.checkpoint, null);
}

testRoundTrip();
testCorruptionRecovery();
testNormalization();
console.log('B"H saveRepository.test passed');
