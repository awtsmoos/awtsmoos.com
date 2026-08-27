// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file inventoryEquipmentLoot.test.mjs
 * @description Verifies atomic Bag, deliberate loot, garments, hand weapons, and hydration.
 * The Awtsmoos makes proof a vessel for visible truth; Awtsmoos.com records that tefillin,
 * jacket variant, chosen treasure, casting, right hand, and model replacement agree.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowEquipmentRuntime } from '../../app/MinimalMeadowEquipmentRuntime.js';
import { interactWithMinimalEnemy } from '../../app/MinimalMeadowEnemyLifecycle.js';
import { InventoryStore } from '../../gameplay/InventoryStore.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';
import { aggregateInventoryStacks } from '../../ui/InventoryPanelState.js';
import { MinimalMeadowEnemyLifecycleFixture } from './inventoryEquipmentLootFixture.mjs';
import {
	inventoryEquipmentPlayerModel,
	waitForEquipment
} from './inventoryEquipmentModelFixture.mjs';

const WEAPON_ANCHOR = 'Awtsmoos_equipped_weapon_hand_anchor';

test('restoration preserves duplicates, overflow, and one aggregate Bag card', () => {
	const store = new InventoryStore();
	store.restore({
		equipment: {},
		items: [
			{ itemId: 'wood-log', quantity: 20 },
			{ itemId: 'wood-log', quantity: 7 },
			{ itemId: 'perutas', quantity: 5 }
		],
		learned: [],
		pinnedBooks: [],
		pinnedPassages: []
	});
	assert.equal(store.quantity('wood-log'), 27);
	assert.deepEqual(
		store.items.filter(stack => stack.itemId === 'wood-log')
			.map(stack => stack.quantity),
		[20, 7]
	);
	assert.equal(
		aggregateInventoryStacks(store.snapshot())
			.find(stack => stack.itemId === 'wood-log').quantity,
		27
	);
});

test('batch loot and purchases publish exactly once', () => {
	const store = new InventoryStore();
	let publications = 0;
	store.onChange(() => publications += 1);
	store.addMany([
		{ itemId: 'wood-log', quantity: 24 },
		{ itemId: 'cottage-flower', quantity: 2 }
	]);
	assert.equal(publications, 1);
	store.buy('wool-thread', 2);
	assert.equal(publications, 2);
	assert.equal(store.quantity('perutas'), 104);
});

test('corpse selection opens loot before any deliberate transfer', () => {
	const fixture = new MinimalMeadowEnemyLifecycleFixture();
	assert.equal(interactWithMinimalEnemy(fixture.actor).reason, 'CORPSE_SELECTED');
	assert.equal(fixture.inventory.quantity('wood-log'), 0);
	assert.equal(interactWithMinimalEnemy(fixture.actor).phase, 'opened');
	assert.equal(fixture.inventory.quantity('wood-log'), 0);
	fixture.actor.takeLootItem('wood-log');
	assert.equal(fixture.inventory.quantity('wood-log'), 3);
	assert.equal(fixture.actor.group.visible, true);
	fixture.actor.takeAllLoot();
	assert.equal(fixture.inventory.quantity('cottage-flower'), 2);
	assert.equal(fixture.actor.group.visible, false);
	assert.equal(
		fixture.events.filter(event => event.type === 'enemy:looted').length,
		1
	);
});

test('tefillin jacket and right-hand weapon persist through casting and hydration', async () => {
	const bus = new AwtsmoosEventBus();
	const inventory = new InventoryStore();
	const runtime = new MinimalMeadowEquipmentRuntime({ bus, inventory });
	const first = inventoryEquipmentPlayerModel('fallback');
	runtime.bindModel(first.model);
	assert.equal(runtime.diagnostics().garments.tefillinJacket, true);
	assert.equal(runtime.drawn, true);
	assert.equal(runtime.weapon.parent.name, WEAPON_ANCHOR);
	assert.equal(runtime.weapon.parent.parent, first.rightHand);
	bus.emit('combat:cast-start', {});
	bus.emit('combat:cast-launch', {});
	await waitForEquipment(250);
	assert.equal(runtime.drawn, true);
	assert.equal(runtime.weapon.parent.name, WEAPON_ANCHOR);
	inventory.unequip('coat');
	assert.equal(runtime.diagnostics().garments.tefillinJacket, false);
	const hydrated = inventoryEquipmentPlayerModel('hydrated');
	runtime.bindModel(hydrated.model);
	assert.equal(runtime.weapon.parent.name, WEAPON_ANCHOR);
	assert.equal(runtime.weapon.parent.parent, hydrated.rightHand);
	assert.equal(runtime.weapon.userData.handBound, true);
	const previousWeapon = runtime.weapon;
	inventory.unequip('hand');
	assert.equal(runtime.weapon, null);
	assert.equal(previousWeapon.visible, false);
	runtime.destroy();
});
