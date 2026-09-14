// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageBridgeRestorationSession.test.mjs
 * @description Proves BRIDGE01 Creator placement consumes once, restores without charging, and refunds failed persistence.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { VillageBridgeRestorationSession } from '../../app/VillageBridgeRestorationSession.js';
import { InventoryStore } from '../../gameplay/InventoryStore.js';
import { BRIDGE_RESTORATION_PART_ID } from '../../world/village/VillageBridgeRestorationContract.js';

function memoryEnvironment() {
	const values = new Map();
	const environment = {
		crypto: globalThis.crypto,
		localStorage: {
		getItem: key => values.get(key) ?? null,
		removeItem: key => values.delete(key),
		setItem: (key, value) => values.set(key, value)
		}
	};
	return environment;
}

function adapter() {
	const ids = new Set();
	return {
		clear: () => ids.clear(),
		ids,
		mount(definition) {
			if (ids.has(definition.id)) throw new Error('duplicate mount');
			ids.add(definition.id);
		},
		remove: id => ids.delete(id)
	};
}

test('successful repair consumes one stone and reload mounts without consuming again', async () => {
	const environment = memoryEnvironment();
	const inventory = new InventoryStore();
	inventory.add('stone-block', 1);
	const firstAdapter = adapter();
	const first = new VillageBridgeRestorationSession({}, inventory, environment, { runtimeAdapter: firstAdapter });
	await first.build();
	assert.equal(inventory.quantity('stone-block'), 0);
	assert.equal(firstAdapter.ids.has(BRIDGE_RESTORATION_PART_ID), true);
	assert.equal((await first.build()).alreadyBuilt, true);
	assert.equal(inventory.quantity('stone-block'), 0);

	const restoredInventory = new InventoryStore();
	const restoredAdapter = adapter();
	const restored = new VillageBridgeRestorationSession({}, restoredInventory, environment, { runtimeAdapter: restoredAdapter });
	assert.equal(restored.restore(), true);
	assert.equal(restoredAdapter.ids.has(BRIDGE_RESTORATION_PART_ID), true);
	assert.equal(restoredInventory.quantity('stone-block'), 0);
});

test('failed durable save compensates document/runtime and refunds the stone', async () => {
	const inventory = new InventoryStore();
	inventory.add('stone-block', 1);
	const runtimeAdapter = adapter();
	const persistence = { load: () => null, save: () => ({ method: 'test', ok: false }) };
	const session = new VillageBridgeRestorationSession({}, inventory, globalThis, {
		persistence,
		runtimeAdapter
	});
	await assert.rejects(() => session.build(), /BRIDGE_RESTORATION_PERSISTENCE_FAILED/);
	assert.equal(inventory.quantity('stone-block'), 1);
	assert.equal(runtimeAdapter.ids.has(BRIDGE_RESTORATION_PART_ID), false);
});
