//B"H
//Boruch Hashem
//Blessed is He

/**
 * A focused witness that one Shlichus survives reload and pays its reward once.
 * The Awtsmoos renews the world without duplicating yesterday's earned light;
 * this test guards the persistence vessel that carries that truth in Awtsmoos.com.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { AdventureStore } from '../../src/gameplay/AdventureStore.js';
import { ShliachProfileStore } from '../../src/gameplay/ShliachProfileStore.js';
import { ShlichusPersistence } from '../../src/gameplay/ShlichusPersistence.js';
import { ShlichusRuntimeCoordinator } from '../../src/gameplay/ShlichusRuntimeCoordinator.js';

const QUEST_ID = 'test-river-light';
const QUEST_CATALOG = Object.freeze([{
	id: QUEST_ID,
	objectives: [{
		count: 1,
		eventType: 'npc:talk',
		id: 'speak-to-keeper',
		target: 'bridge-keeper'
	}],
	reward: {
		mitzvahPoints: 5,
		xp: 40
	},
	title: 'The River Light',
	worldEffects: []
}]);

class MemoryStorage {
	constructor() {
		this.values = new Map();
	}

	getItem(key) {
		return this.values.has(key) ? this.values.get(key) : null;
	}

	removeItem(key) {
		this.values.delete(key);
	}

	setItem(key, value) {
		this.values.set(key, String(value));
	}
}

function createRuntime(storage, rewardEvents) {
	const adventures = new AdventureStore({ catalog: QUEST_CATALOG });
	const profile = new ShliachProfileStore();
	const persistence = new ShlichusPersistence({
		key: 'test.shlichus.persistence',
		storage
	});
	const runtime = new ShlichusRuntimeCoordinator({
		adventures,
		bus: {
			emit(type, detail) {
				if (type === 'quest:reward') rewardEvents.push(detail);
			}
		},
		persistence,
		profile
	});
	return { adventures, profile, runtime };
}

test('Shlichus restores progress and never duplicates a completed reward', () => {
	const storage = new MemoryStorage();
	const rewardEvents = [];
	const first = createRuntime(storage, rewardEvents);
	first.adventures.offer(QUEST_ID);
	first.adventures.accept(QUEST_ID);
	assert.equal(first.adventures.get(QUEST_ID).status, 'active');
	first.runtime.destroy();
	first.profile.destroy();

	const restored = createRuntime(storage, rewardEvents);
	assert.equal(restored.adventures.get(QUEST_ID).status, 'active');
	restored.adventures.recordEvent({
		target: 'bridge-keeper',
		type: 'npc:talk'
	});
	assert.equal(restored.adventures.get(QUEST_ID).status, 'completed');
	assert.equal(restored.profile.snapshot().xp, 40);
	assert.equal(restored.profile.snapshot().mitzvahPoints, 5);
	assert.equal(rewardEvents.length, 1);
	assert.deepEqual(restored.runtime.snapshot().grantedQuestIds, [QUEST_ID]);
	restored.runtime.destroy();
	restored.profile.destroy();

	const reloaded = createRuntime(storage, rewardEvents);
	assert.equal(reloaded.adventures.get(QUEST_ID).status, 'completed');
	assert.equal(reloaded.profile.snapshot().xp, 40);
	assert.equal(reloaded.profile.snapshot().mitzvahPoints, 5);
	assert.equal(rewardEvents.length, 1);
	assert.deepEqual(reloaded.runtime.snapshot().grantedQuestIds, [QUEST_ID]);
	assert.equal(reloaded.runtime.snapshot().persistence.restored, true);
	reloaded.runtime.destroy();
	reloaded.profile.destroy();
});
