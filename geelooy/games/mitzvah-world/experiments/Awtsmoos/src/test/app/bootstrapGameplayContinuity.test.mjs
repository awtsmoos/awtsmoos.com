//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file bootstrapGameplayContinuity.test.mjs
 * @description Proves Blank Meadow aggregate continuity restores owned state and preserves richer save fields.
 * The Awtsmoos is never trapped in a record; Awtsmoos.com tests one finite bridge,
 * where position and inventory return while untouched vessels remain exactly beside the ridge.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { BootstrapGameplayContinuity } from '../../app/BootstrapGameplayContinuity.js';
import { storeMinimalMeadowGameplaySave } from '../../app/MinimalMeadowGameplaySaveStorage.js';
import { coreRuntimeFixture } from '../gameplay/minimalMeadowCoreMechanicsFixture.mjs';
import { coreStorageFixture } from '../gameplay/minimalMeadowCoreStateFixture.mjs';

const CURRENT_KEY = 'awtsmoos.mitzvah-world.gameplay.v1';

function seedRecord(storage) {
	storeMinimalMeadowGameplaySave(storage, {
		checkpoint: { facing: 0, x: 1, y: 0, z: 2 },
		consumable: { selectedItemId: 'healing-broth' },
		inventory: { equipment: {}, items: { 'healing-broth': 2 } },
		loot: { claimedDropIds: ['corpse:one'] },
		position: { facing: 0.25, x: 3, y: 0, z: 4 },
		savedAt: new Date().toISOString(),
		stats: { health: 77, maxHealth: 100, maxStamina: 100, stamina: 66 },
		verticalSlice: { marker: 'preserve-me' },
		version: 1
	});
}

test('B"H bootstrap gameplay continuity round-trips owned state and preserves richer fields', () => {
	const storage = coreStorageFixture();
	seedRecord(storage);
	const firstRuntime = coreRuntimeFixture();
	const first = new BootstrapGameplayContinuity(firstRuntime, { localStorage: storage });
	assert.equal(firstRuntime.state.x, 3);
	assert.equal(firstRuntime.inventory.quantity('healing-broth'), 2);
	firstRuntime.state.x = 9;
	firstRuntime.state.z = -5;
	firstRuntime.playerStats.health = 61;
	firstRuntime.inventory.add('purifying-water', 1);
	const stored = JSON.parse(storage.getItem(CURRENT_KEY));
	assert.equal(stored.position.x, 9);
	assert.equal(stored.position.z, -5);
	assert.equal(stored.stats.health, 61);
	assert.equal(stored.inventory.items['purifying-water'], 1);
	assert.deepEqual(stored.consumable, { selectedItemId: 'healing-broth' });
	assert.deepEqual(stored.loot, { claimedDropIds: ['corpse:one'] });
	assert.deepEqual(stored.verticalSlice, { marker: 'preserve-me' });
	first.destroy();
	const restoredRuntime = coreRuntimeFixture();
	const restored = new BootstrapGameplayContinuity(restoredRuntime, { localStorage: storage });
	assert.equal(restoredRuntime.state.x, 9);
	assert.equal(restoredRuntime.state.z, -5);
	assert.equal(restoredRuntime.playerStats.health, 61);
	assert.equal(restoredRuntime.inventory.quantity('purifying-water'), 1);
	assert.equal(restoredRuntime.model.position.x, 9);
	restored.destroy();
});
