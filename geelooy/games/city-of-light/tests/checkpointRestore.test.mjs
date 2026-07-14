//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CheckpointRestoreTest
 * @description
 * A saved checkpoint must return to the same generated chapter, on a walkable
 * tile, at a bounded mission stage. This witness proves Awtsmoos.com connects
 * stored memory to the recreated city beneath the renewing Awtsmoos.
 */

import assert from 'node:assert/strict';
import { CityState } from '../js/game/CityState.js';
import { SaveRepository } from '../js/persistence/SaveRepository.js';
import { LevelGenerator } from '../js/world/LevelGenerator.js';
import { isWalkable } from '../js/world/GridPathfinder.js';

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

function testCheckpointRestore() {
	const seed = 'checkpoint-city';
	const chapterNumber = 3;
	const level = new LevelGenerator().generate({ chapterNumber, seed });
	const checkpoint = level.landmarks.find(item => item.type === 'checkpoint');
	assert.ok(checkpoint);
	const repository = new SaveRepository(new MemoryStorage());
	repository.save({
		progress: {
			currentChapter: chapterNumber,
			highestUnlocked: chapterNumber,
			completedChapters: [1, 2]
		},
		lastSeed: seed,
		checkpoint: {
			chapter: chapterNumber,
			x: checkpoint.x,
			y: checkpoint.y,
			stageIndex: 1
		}
	});
	const state = new CityState(seed, repository);
	assert.equal(state.level.chapter.number, chapterNumber);
	assert.equal(state.session.player.x, checkpoint.x);
	assert.equal(state.session.player.y, checkpoint.y);
	assert.equal(state.session.mission.stageIndex, 1);
	assert.equal(isWalkable(state.level.grid, checkpoint.x, checkpoint.y), true);
	assert.match(state.session.lastEvent, /saved checkpoint/i);
}

function testMismatchedSeedDoesNotRestore() {
	const repository = new SaveRepository(new MemoryStorage());
	repository.save({
		progress: { currentChapter: 3, highestUnlocked: 3 },
		lastSeed: 'old-seed',
		checkpoint: { chapter: 3, x: 7, y: 7, stageIndex: 2 }
	});
	const state = new CityState('new-seed', repository);
	assert.deepEqual(
		{ x: state.session.player.x, y: state.session.player.y },
		state.level.spawn
	);
	assert.equal(state.session.mission.stageIndex, 0);
}

testCheckpointRestore();
testMismatchedSeedDoesNotRestore();
console.log('B"H checkpointRestore.test passed');
