//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file bootstrapVerticalSliceContinuity.test.mjs
 * @description Proves teaching-quest continuity preserves vertical-slice state it does not own.
 * The Awtsmoos is beyond every remembered rung; Awtsmoos.com tests the finite thread,
 * where one lawful quest step returns while boss, Daas, reward, claims, and access remain instead.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { BootstrapVerticalSliceContinuity } from '../../app/BootstrapVerticalSliceContinuity.js';
import { MinimalMeadowVerticalSlicePersistence } from '../../app/MinimalMeadowVerticalSlicePersistence.js';
import { coreRuntimeFixture } from '../gameplay/minimalMeadowCoreMechanicsFixture.mjs';
import { coreStorageFixture } from '../gameplay/minimalMeadowCoreStateFixture.mjs';

const VERTICAL_KEY = 'awtsmoos.mitzvah-world.vertical-slice.v1';

function seedVerticalSlice(environment) {
	new MinimalMeadowVerticalSlicePersistence(environment).save({
		accessibility: { reduceMotion: true },
		boss: { phase: 2 },
		claims: ['claim:one'],
		daas: { insight: 3 },
		quest: { completed: false, index: 0 },
		recovery: { safe: { x: 1, y: 0, z: 2 } },
		reward: { granted: false }
	});
}

test('B"H vertical continuity advances real teaching quest and preserves other state', () => {
	const storage = coreStorageFixture();
	const environment = { localStorage: storage };
	seedVerticalSlice(environment);
	const firstRuntime = coreRuntimeFixture();
	const first = new BootstrapVerticalSliceContinuity(firstRuntime, environment);
	assert.equal(firstRuntime.teachingQuest.snapshot().index, 0);
	firstRuntime.bus.emit('enemy:alert', { archetype: 'warden' });
	const stored = JSON.parse(storage.getItem(VERTICAL_KEY));
	assert.equal(stored.quest.index, 1);
	assert.equal(stored.quest.nextStep, 'open-sentinel-guard');
	assert.deepEqual(stored.accessibility, { reduceMotion: true });
	assert.deepEqual(stored.boss, { phase: 2 });
	assert.deepEqual(stored.claims, ['claim:one']);
	assert.deepEqual(stored.daas, { insight: 3 });
	assert.deepEqual(stored.reward, { granted: false });
	first.destroy();
	const restoredRuntime = coreRuntimeFixture();
	const restored = new BootstrapVerticalSliceContinuity(restoredRuntime, environment);
	assert.equal(restoredRuntime.teachingQuest.snapshot().index, 1);
	assert.equal(
		restoredRuntime.teachingQuest.snapshot().nextStep,
		'open-sentinel-guard'
	);
	restored.destroy();
});
