//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file bootstrapContinuityPreservation.test.mjs
 * @description Proves narrow first-control saves preserve state owned by richer systems.
 * The Awtsmoos joins many vessels without confusing their domain or name;
 * Awtsmoos.com lets quest and inventory move while boss, Daas, loot, and reward remain the same.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { installBootstrapCoreStateSystems } from '../../app/BootstrapCoreStateSystems.js';
import {
	loadMinimalMeadowGameplaySave,
	storeMinimalMeadowGameplaySave
} from '../../app/MinimalMeadowGameplaySaveStorage.js';
import { MinimalMeadowVerticalSlicePersistence } from '../../app/MinimalMeadowVerticalSlicePersistence.js';
import {
	BootstrapStateMemoryStorage,
	createBlankMeadowStateRuntime
} from './BootstrapStateTestSupport.mjs';

test('B"H bootstrap continuity preserves fields it does not own', () => {
	const localStorage = new BootstrapStateMemoryStorage();
	storeMinimalMeadowGameplaySave(localStorage, {
		checkpoint: { facing: 0, x: 1, y: 0, z: 2 },
		consumable: { charges: 2 },
		inventory: { equipment: {}, items: {} },
		loot: { claims: ['old-loot'] },
		position: { facing: 0, x: 1, y: 0, z: 2 },
		savedAt: 'seed',
		stats: { health: 90, maxHealth: 100, maxStamina: 100, stamina: 80 },
		verticalSlice: { marker: 'aggregate-owned-elsewhere' },
		version: 1
	});

	const verticalPersistence = new MinimalMeadowVerticalSlicePersistence({ localStorage });
	verticalPersistence.save({
		accessibility: { captions: true },
		boss: { phase: 3 },
		claims: ['reward-one'],
		daas: { score: 7 },
		quest: { completed: false, index: 0 },
		recovery: { recoveries: 4 },
		reward: { granted: true }
	});

	const runtime = createBlankMeadowStateRuntime();
	installBootstrapCoreStateSystems(runtime, { localStorage });
	runtime.inventory.add('purifying-water', 1);
	runtime.teachingQuest.advance(0);

	const gameplay = loadMinimalMeadowGameplaySave(localStorage).record;
	const verticalSlice = verticalPersistence.load();
	assert.deepEqual(gameplay.consumable, { charges: 2 });
	assert.deepEqual(gameplay.loot, { claims: ['old-loot'] });
	assert.deepEqual(gameplay.verticalSlice, { marker: 'aggregate-owned-elsewhere' });
	assert.deepEqual(verticalSlice.accessibility, { captions: true });
	assert.deepEqual(verticalSlice.boss, { phase: 3 });
	assert.deepEqual(verticalSlice.claims, ['reward-one']);
	assert.deepEqual(verticalSlice.daas, { score: 7 });
	assert.deepEqual(verticalSlice.reward, { granted: true });
	assert.equal(verticalSlice.quest.index, 1);
});
