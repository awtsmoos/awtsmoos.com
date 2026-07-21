// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shlichusPersistence.test.mjs
 * @description Proves completed Shlichus state survives reload without duplicating its reward.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AdventureStore } from '../../gameplay/AdventureStore.js';
import { ShliachProfileStore } from '../../gameplay/ShliachProfileStore.js';
import { ShlichusPersistence } from '../../gameplay/ShlichusPersistence.js';
import { ShlichusRuntimeCoordinator } from '../../gameplay/ShlichusRuntimeCoordinator.js';

test('completed Shlichus restores and grants its reward exactly once', () => {
	const storage = memoryStorage();
	const rewardEvents = [];
	const bus = { emit: (type, detail) => rewardEvents.push({ detail, type }) };
	const persistence = new ShlichusPersistence({ key: 'test.shlichus', storage });
	const firstAdventures = new AdventureStore();
	const firstProfile = new ShliachProfileStore();
	const firstRuntime = new ShlichusRuntimeCoordinator({
		adventures: firstAdventures,
		bus,
		persistence,
		profile: firstProfile
	});

	firstAdventures.accept('sparks-at-east-gate');
	firstAdventures.recordEvent({ count: 3, target: 'dybbuk-shade', type: 'defeat' });
	const completedProfile = firstProfile.serializableState();
	assert.equal(firstAdventures.get('sparks-at-east-gate').status, 'completed');
	assert.deepEqual(firstRuntime.snapshot().grantedQuestIds, ['sparks-at-east-gate']);
	assert.equal(rewardEvents.length, 1);
	firstRuntime.destroy();
	firstProfile.destroy();

	const restoredAdventures = new AdventureStore();
	const restoredProfile = new ShliachProfileStore();
	const restoredRuntime = new ShlichusRuntimeCoordinator({
		adventures: restoredAdventures,
		bus,
		persistence,
		profile: restoredProfile
	});

	assert.equal(restoredAdventures.get('sparks-at-east-gate').status, 'completed');
	assert.deepEqual(restoredProfile.serializableState(), completedProfile);
	assert.deepEqual(restoredRuntime.snapshot().grantedQuestIds, ['sparks-at-east-gate']);
	assert.equal(rewardEvents.length, 1);
	restoredRuntime.destroy();
	restoredProfile.destroy();
});

function memoryStorage() {
	const values = new Map();
	return {
		getItem: key => values.get(key) ?? null,
		removeItem: key => values.delete(key),
		setItem: (key, value) => values.set(key, value)
	};
}
