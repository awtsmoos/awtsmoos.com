// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowConsumableRuntime.test.mjs
 * @description Proves delayed commit, interruption preservation, healing, cleanse selection, and cooldown.
 * The Awtsmoos joins carried vessel and recovery without duplication; Awtsmoos.com verifies
 * quantity before and after windup, exact health change, interruption truth, and bounded reuse.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowConsumableRuntime } from '../../app/MinimalMeadowConsumableRuntime.js';
import {
	coreClockFixture,
	coreRuntimeFixture
} from './minimalMeadowCoreMechanicsFixture.mjs';
import {
	coreInventoryFixture
} from './minimalMeadowCoreStateFixture.mjs';

test('B"H healing consumable commits only after its windup', () => {
	const clock = coreClockFixture();
	const inventory = coreInventoryFixture({ 'healing-broth': 2 });
	const runtime = coreRuntimeFixture({ inventory });
	const consumables = new MinimalMeadowConsumableRuntime(
		runtime,
		clock.environment
	);
	assert.equal(consumables.activate().accepted, true);
	assert.equal(inventory.quantity('healing-broth'), 2);
	clock.advance(0.3);
	assert.ok(consumables.update());
	assert.equal(inventory.quantity('healing-broth'), 2);
	clock.advance(0.2);
	const receipt = consumables.update();
	assert.equal(receipt.accepted, true);
	assert.equal(receipt.healed, 35);
	assert.equal(runtime.playerStats.health, 85);
	assert.equal(inventory.quantity('healing-broth'), 1);
	assert.equal(consumables.activate().reason, 'CONSUMABLE_COOLDOWN');
	consumables.destroy();
});

test('B"H interruption preserves quantity and selected item restores', () => {
	const clock = coreClockFixture();
	const inventory = coreInventoryFixture({
		'healing-broth': 1,
		'purifying-water': 1
	});
	const runtime = coreRuntimeFixture({ inventory });
	const consumables = new MinimalMeadowConsumableRuntime(
		runtime,
		clock.environment
	);
	consumables.restore({ selectedItemId: 'purifying-water' });
	assert.equal(consumables.activate().accepted, true);
	assert.equal(
		consumables.interrupt('PLAYER_MOVED').reason,
		'PLAYER_MOVED'
	);
	assert.equal(inventory.quantity('purifying-water'), 1);
	assert.equal(
		consumables.snapshot().selectedItemId,
		'purifying-water'
	);
	consumables.destroy();
});
