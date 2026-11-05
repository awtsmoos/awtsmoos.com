// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowGameplayPersistence.test.mjs
 * @description Proves aggregate round-trip, inventory/selection/loot restore, and corrupt-current backup fallback.
 * The Awtsmoos is never contained by memory; Awtsmoos.com verifies one versioned witness,
 * exact stable state, current/backup order, corruption truth, and idempotent reconstruction.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowGameplayPersistence } from '../../app/MinimalMeadowGameplayPersistence.js';
import {
	coreRuntimeFixture
} from './minimalMeadowCoreMechanicsFixture.mjs';
import {
	coreInventoryFixture,
	coreStorageFixture
} from './minimalMeadowCoreStateFixture.mjs';

const CURRENT_KEY = 'awtsmoos.mitzvah-world.gameplay.v1';

function persistenceFixture(storage) {
	const inventory = coreInventoryFixture({ 'healing-broth': 2 });
	const runtime = coreRuntimeFixture({ inventory });
	const consumable = { selectedItemId: 'healing-broth' };
	const loot = { claimedDropIds: [] };
	const core = {
		consumables: {
			restore(value = {}) {
				consumable.selectedItemId = value.selectedItemId
					|| consumable.selectedItemId;
			},
			snapshot: () => ({
				selectedItemId: consumable.selectedItemId
			})
		},
		loot: {
			restore(value = {}) {
				loot.claimedDropIds = [
					...(value.claimedDropIds || [])
				];
			},
			snapshot: () => ({
				claimedDropIds: [...loot.claimedDropIds]
			})
		}
	};
	const environment = {
		addEventListener() {},
		localStorage: storage,
		removeEventListener() {}
	};
	return {
		consumable,
		controller: new MinimalMeadowGameplayPersistence(
			runtime,
			core,
			environment
		),
		loot,
		runtime
	};
}

test('B"H aggregate gameplay save restores stable player and store state', () => {
	const storage = coreStorageFixture();
	const first = persistenceFixture(storage);
	first.runtime.state.x = 8;
	first.runtime.state.z = -3;
	first.runtime.playerStats.health = 77;
	first.runtime.inventory.add('purifying-water', 1);
	first.consumable.selectedItemId = 'purifying-water';
	first.loot.claimedDropIds = ['corpse:one'];
	assert.equal(first.controller.save('test').stored, true);
	const second = persistenceFixture(storage);
	assert.equal(second.runtime.state.x, 8);
	assert.equal(second.runtime.state.z, -3);
	assert.equal(second.runtime.playerStats.health, 77);
	assert.equal(
		second.runtime.inventory.quantity('purifying-water'),
		1
	);
	assert.equal(second.consumable.selectedItemId, 'purifying-water');
	assert.deepEqual(second.loot.claimedDropIds, ['corpse:one']);
});

test('B"H corrupt current save falls back to the previous valid record', () => {
	const storage = coreStorageFixture();
	const first = persistenceFixture(storage);
	first.runtime.state.x = 2;
	first.controller.save('first');
	first.runtime.state.x = 9;
	first.controller.save('second');
	storage.setItem(CURRENT_KEY, '{broken');
	const recovered = persistenceFixture(storage);
	assert.equal(recovered.controller.snapshot().source, 'backup');
	assert.equal(recovered.runtime.state.x, 2);
});
