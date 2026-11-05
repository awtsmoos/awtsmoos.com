// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file inventoryTorahTools.test.mjs
 * @description Proves purchases, complete equipment stats, tool gates, learning, and cooldowns.
 * The Awtsmoos renews every carried and learned vessel beneath measured limits;
 * Awtsmoos.com counts the entire canonical outfit and refuses actions without preparation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { INVENTORY_CATALOG } from '../../gameplay/InventoryCatalog.js';
import { InventoryStore } from '../../gameplay/InventoryStore.js';
import {
	validateToolAction,
	validateTorahAction
} from '../../gameplay/ToolActionPolicy.js';

function policyState(store) {
	const state = store.snapshot();
	return {
		equipment: state.equipment,
		items: state.items.map(item => ({
			itemId: item.itemId,
			quantity: item.quantity
		}))
	};
}

test('catalog keys and public item ids are identical', () => {
	for (const [itemId, definition] of Object.entries(INVENTORY_CATALOG)) {
		assert.equal(definition.id, itemId);
	}
});

test('buying and equipping an axe enables woodcutting', () => {
	const store = new InventoryStore();
	assert.throws(
		() => validateToolAction('chop', policyState(store)),
		/REQUIRED_ITEM_NOT_OWNED/
	);
	store.buy('forest-axe');
	assert.equal(store.owns('forest-axe'), true);
	assert.equal(
		store.snapshot().items.find(item => item.itemId === 'perutas').quantity,
		75
	);
	assert.throws(
		() => validateToolAction('chop', policyState(store)),
		/REQUIRED_ITEM_NOT_EQUIPPED/
	);
	store.equip('forest-axe');
	assert.equal(
		validateToolAction('chop', policyState(store), {
			target: 'fallen-wood'
		}).allowed,
		true
	);
});

test('complete equipment and clothing contribute to derived statistics', () => {
	const store = new InventoryStore();
	const initial = store.snapshot().stats;
	assert.equal(initial.damage, 26);
	assert.equal(initial.defense, 24);
	assert.equal(initial.focus, 48);
	store.add('village-shield');
	store.equip('village-shield');
	assert.equal(store.snapshot().stats.defense, 34);
});

test('Torah passages require learning, focus, and cooldown', () => {
	const store = new InventoryStore();
	assert.throws(
		() => validateTorahAction(
			'creation-light',
			store.snapshot(),
			{ focus: 30, now: 2000 }
		),
		/PASSAGE_NOT_LEARNED/
	);
	store.add('chumash-light');
	store.learn('creation-light');
	const allowed = validateTorahAction(
		'creation-light',
		store.snapshot(),
		{ focus: 30, now: 2000 }
	);
	assert.equal(allowed.damage, 24);
	store.markPassageUsed('creation-light', 2000);
	assert.throws(
		() => validateTorahAction(
			'creation-light',
			store.snapshot(),
			{ focus: 30, now: 2500 }
		),
		/PASSAGE_COOLDOWN/
	);
	assert.throws(
		() => validateTorahAction(
			'creation-light',
			store.snapshot(),
			{ focus: 3, now: 4000 }
		),
		/INSUFFICIENT_FOCUS/
	);
});
