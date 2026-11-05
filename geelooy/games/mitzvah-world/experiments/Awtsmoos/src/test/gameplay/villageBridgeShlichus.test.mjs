// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageBridgeShlichus.test.mjs
 * @description Proves Village Bridge Trial grants one stone-block exactly once across replay and reload.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AdventureStore } from '../../gameplay/AdventureStore.js';
import { InventoryStore } from '../../gameplay/InventoryStore.js';
import { ShliachProfileStore } from '../../gameplay/ShliachProfileStore.js';
import { ShlichusPersistence } from '../../gameplay/ShlichusPersistence.js';
import { ShlichusRuntimeCoordinator } from '../../gameplay/ShlichusRuntimeCoordinator.js';
import { VILLAGE_BRIDGE_TRIAL_QUEST_ID } from '../../gameplay/VillageBridgeAdventures.js';

function memoryStorage() {
	const values = new Map();
	return {
		getItem: key => values.get(key) ?? null,
		removeItem: key => values.delete(key),
		setItem: (key, value) => values.set(key, value)
	};
}

function createRuntime(persistence, rewardEvents) {
	const adventures = new AdventureStore();
	const inventory = new InventoryStore();
	const profile = new ShliachProfileStore({ inventory });
	const coordinator = new ShlichusRuntimeCoordinator({
		adventures,
		bus: { emit: (type, detail) => rewardEvents.push({ detail, type }) },
		inventory,
		persistence,
		profile
	});
	return { adventures, coordinator, inventory, profile };
}

test('Bridge Trial stone reward is exact-once through replay and reload', () => {
	const storage = memoryStorage();
	const events = [];
	const persistence = new ShlichusPersistence({ key: 'test.bridge.shlichus', storage });
	const first = createRuntime(persistence, events);
	first.adventures.offer(VILLAGE_BRIDGE_TRIAL_QUEST_ID);
	first.adventures.accept(VILLAGE_BRIDGE_TRIAL_QUEST_ID);
	first.adventures.recordEvent({ count: 1, target: 'village-bridge-trial', type: 'activity' });
	assert.equal(first.adventures.get(VILLAGE_BRIDGE_TRIAL_QUEST_ID).status, 'completed');
	assert.equal(first.inventory.quantity('stone-block'), 1);
	first.adventures.recordEvent({ count: 1, target: 'village-bridge-trial', type: 'activity' });
	assert.equal(first.inventory.quantity('stone-block'), 1);
	assert.equal(events.filter(event => event.type === 'quest:reward').length, 1);
	first.coordinator.destroy();
	first.profile.destroy();

	const restored = createRuntime(persistence, events);
	assert.equal(restored.adventures.get(VILLAGE_BRIDGE_TRIAL_QUEST_ID).status, 'completed');
	assert.equal(restored.inventory.quantity('stone-block'), 1);
	assert.equal(events.filter(event => event.type === 'quest:reward').length, 1);
	restored.coordinator.destroy();
	restored.profile.destroy();
});
