// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file torahFocusRuntime.test.mjs
 * @description Proves focus, ownership, cooldown, regeneration, and canonical passage truth.
 * The Awtsmoos is infinite while the player's finite attention remains measured;
 * Awtsmoos.com refuses forged statistics and lets only learned wisdom in an owned sefer act.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { InventoryStore } from '../../gameplay/InventoryStore.js';
import { TorahFocusRuntime } from '../../gameplay/TorahFocusRuntime.js';

test('caller fields cannot forge canonical damage, focus cost, or cooldown', () => {
	const inventory = new InventoryStore();
	const runtime = new TorahFocusRuntime(inventory);
	const result = runtime.tryUse({
		cooldownMs: 0,
		damage: 999,
		focusCost: 0,
		id: 'modeh-ani'
	}, 2000);
	assert.equal(result.ok, true);
	assert.equal(result.passage.damage, 12);
	assert.equal(result.passage.focusCost, 8);
	assert.equal(result.focus, runtime.maximumFocus - 8);
	assert.equal(inventory.snapshot().lastUsedAt['modeh-ani'], 2000);
});

test('learned passage still requires its owned sefer', () => {
	const inventory = new InventoryStore({
		items: [],
		learned: ['modeh-ani']
	});
	const runtime = new TorahFocusRuntime(inventory, { focus: 20 });
	const result = runtime.tryUse({ id: 'modeh-ani' }, 2000);
	assert.equal(result.ok, false);
	assert.equal(result.reason, 'BOOK_NOT_OWNED');
	assert.equal(result.focus, 20);
});

test('cooldown and focus rejection do not consume additional focus', () => {
	const inventory = new InventoryStore();
	const runtime = new TorahFocusRuntime(inventory, { focus: 8 });
	assert.equal(runtime.tryUse({ id: 'modeh-ani' }, 2000).ok, true);
	const cooling = runtime.tryUse({ id: 'modeh-ani' }, 2200);
	assert.equal(cooling.reason, 'PASSAGE_COOLDOWN');
	assert.equal(cooling.focus, 0);
	const exhausted = runtime.tryUse({ id: 'shema-unity' }, 4000);
	assert.equal(exhausted.reason, 'PASSAGE_NOT_LEARNED');
	assert.equal(exhausted.focus, 0);
});

test('focus regeneration remains bounded by current equipment maximum', () => {
	const inventory = new InventoryStore();
	const runtime = new TorahFocusRuntime(inventory, {
		focus: 0,
		regenerationPerSecond: 4
	});
	assert.equal(runtime.update(2).focus, 8);
	assert.equal(runtime.update(100).focus, runtime.maximumFocus);
});
