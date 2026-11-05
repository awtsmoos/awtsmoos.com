// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { AdventureStore } from '../../gameplay/AdventureStore.js';
import { InventoryStore } from '../../gameplay/InventoryStore.js';
import { RIVER_CROSSING_SHLICHUS } from '../../gameplay/RiverCrossingShlichus.js';
import { ShliachProfileStore } from '../../gameplay/ShliachProfileStore.js';
import { ShlichusPersistence } from '../../gameplay/ShlichusPersistence.js';
import { ShlichusRuntimeCoordinator } from '../../gameplay/ShlichusRuntimeCoordinator.js';

test('river reward inventory persists once while its world effect restores', () => {
	const storage = memoryStorage();
	const events = [];
	const persistence = new ShlichusPersistence({ key: 'test.river.reward', storage });
	const first = runtime(persistence, events);
	first.adventures.accept(RIVER_CROSSING_SHLICHUS.id);
	completeRiverMission(first.adventures);
	assert.equal(perutas(first.inventory), 144);
	assert.ok(first.inventory.snapshot().learned.includes('living-water'));
	assert.equal(eventCount(events, 'quest:reward'), 1);
	assert.equal(eventCount(events, 'bridge:lanterns'), 1);
	assert.equal(first.coordinator.snapshot().persistence.failures, 0);
	assert.ok(first.coordinator.snapshot().persistence.writes > 0);
	first.destroy();

	const restored = runtime(persistence, events);
	assert.equal(restored.adventures.get(RIVER_CROSSING_SHLICHUS.id).status, 'completed');
	assert.equal(perutas(restored.inventory), 144);
	assert.ok(restored.inventory.snapshot().learned.includes('living-water'));
	assert.deepEqual(restored.coordinator.snapshot().grantedQuestIds, [RIVER_CROSSING_SHLICHUS.id]);
	assert.equal(restored.coordinator.snapshot().persistence.restored, true);
	assert.equal(eventCount(events, 'quest:reward'), 1);
	assert.equal(eventCount(events, 'bridge:lanterns'), 2);
	assert.equal(events.filter(event => event.type === 'bridge:lanterns')[1].detail.source, 'restore');
	restored.destroy();
});

function runtime(persistence, events) {
	const adventures = new AdventureStore({ catalog: [RIVER_CROSSING_SHLICHUS] });
	const inventory = new InventoryStore();
	const profile = new ShliachProfileStore({ inventory });
	const coordinator = new ShlichusRuntimeCoordinator({
		adventures,
		bus: { emit: (type, detail) => events.push({ detail, type }) },
		inventory,
		persistence,
		profile
	});
	return {
		adventures,
		coordinator,
		destroy: () => {
			coordinator.destroy();
			profile.destroy();
		},
		inventory
	};
}

function completeRiverMission(adventures) {
	for (const [type, target, count] of [
		['npc:talk', 'bridge-keeper', 1],
		['bridge:inspect', 'damaged-bridge-point', 3],
		['inventory:add', 'treated-timber', 4],
		['defeat', 'dybbuk-shade', 2],
		['torah', 'light-against-concealment', 1],
		['npc:talk', 'bridge-keeper', 1]
	]) adventures.recordEvent({ count, target, type });
}

function perutas(inventory) {
	return inventory.snapshot().items.find(item => item.itemId === 'perutas')?.quantity || 0;
}

function eventCount(events, type) {
	return events.filter(event => event.type === type).length;
}

function memoryStorage() {
	const values = new Map();
	return {
		getItem: key => values.get(key) ?? null,
		removeItem: key => values.delete(key),
		setItem: (key, value) => values.set(key, value)
	};
}
