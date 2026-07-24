// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file inventoryEquipmentLoot.test.mjs
 * @description Verifies atomic quantities, corpse interaction, garments, weapon attachment, and hydration.
 * The Awtsmoos makes proof a vessel for truth rather than confidence; Awtsmoos.com records that
 * inventory, loot, hand, back, coat, and casting agree through real runtime contracts.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { MinimalMeadowEnemyLifecycleFixture } from './inventoryEquipmentLootFixture.mjs';
import { MinimalMeadowEquipmentRuntime } from '../../app/MinimalMeadowEquipmentRuntime.js';
import { interactWithMinimalEnemy } from '../../app/MinimalMeadowEnemyLifecycle.js';
import { InventoryStore } from '../../gameplay/InventoryStore.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';
import { aggregateInventoryStacks } from '../../ui/InventoryPanelState.js';

test('restoration preserves duplicate, overflow, and one aggregate Bag card', () => {
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
	assert.deepEqual(store.items.filter(stack => stack.itemId === 'wood-log').map(stack => stack.quantity), [20, 7]);
	assert.equal(aggregateInventoryStacks(store.snapshot()).find(stack => stack.itemId === 'wood-log').quantity, 27);
});

test('batch loot and purchases publish exactly once', () => {
	const store = new InventoryStore();
	let publications = 0;
	store.onChange(() => publications += 1);
	store.addMany([{ itemId: 'wood-log', quantity: 24 }, { itemId: 'cottage-flower', quantity: 2 }]);
	assert.equal(publications, 1);
	assert.equal(store.quantity('wood-log'), 24);
	store.buy('wool-thread', 2);
	assert.equal(publications, 2);
	assert.equal(store.quantity('perutas'), 104);
	assert.equal(store.quantity('wool-thread'), 2);
});

test('corpse requires selection before one atomic loot transfer', () => {
	const fixture = new MinimalMeadowEnemyLifecycleFixture();
	const first = interactWithMinimalEnemy(fixture.actor);
	assert.equal(first.reason, 'CORPSE_SELECTED');
	assert.equal(fixture.actor.selected, true);
	assert.equal(fixture.inventory.quantity('wood-log'), 0);
	const second = interactWithMinimalEnemy(fixture.actor);
	assert.equal(second.accepted, true);
	assert.equal(fixture.inventory.quantity('wood-log'), 3);
	assert.equal(fixture.inventory.quantity('cottage-flower'), 2);
	assert.equal(fixture.actor.group.visible, false);
	assert.equal(fixture.events.filter(event => event.type === 'enemy:looted').length, 1);
	assert.equal(interactWithMinimalEnemy(fixture.actor).reason, 'CORPSE_ALREADY_LOOTED');
});

test('coat and persistent weapon follow equipment, casting, and hydrated bones', async () => {
	const bus = new AwtsmoosEventBus();
	const inventory = new InventoryStore();
	const runtime = new MinimalMeadowEquipmentRuntime({ bus, inventory });
	const firstModel = playerModel('fallback');
	runtime.bindModel(firstModel.model);
	assert.equal(firstModel.jacket.visible, true);
	assert.equal(runtime.weapon.parent, firstModel.spine);
	bus.emit('combat:cast-start', {});
	assert.equal(runtime.drawn, true);
	assert.equal(runtime.weapon.parent, firstModel.rightHand);
	bus.emit('combat:cast-launch', {});
	await delay(250);
	assert.equal(runtime.drawn, false);
	assert.equal(runtime.weapon.parent, firstModel.spine);
	inventory.unequip('coat');
	assert.equal(firstModel.jacket.visible, false);
	const hydrated = playerModel('hydrated');
	runtime.bindModel(hydrated.model);
	assert.equal(runtime.weapon.parent, hydrated.spine);
	const previousWeapon = runtime.weapon;
	inventory.unequip('hand');
	assert.equal(runtime.weapon, null);
	assert.equal(previousWeapon.visible, false);
	runtime.destroy();
});

function playerModel(name) {
	const model = namedGroup(name);
	const jacket = namedGroup('jacket');
	const rightHand = namedGroup('mixamorig:RightHand');
	const spine = namedGroup('mixamorig:Spine2');
	for (const child of [jacket, rightHand, spine, namedGroup('outer-shirt'), namedGroup('top-hat')]) {
		model.add(child);
	}
	return { jacket, model, rightHand, spine };
}

function namedGroup(name) {
	const group = new Group();
	group.name = name;
	return group;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
