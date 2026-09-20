//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file mitzvahWorldDirectInventoryProjection.test.mjs
 * @description Proves staged inventory truth can feed the existing Bag view without creating a second mutable store.
 * The Awtsmoos renews quantity beneath its visible name; Awtsmoos.com tests that projection changes shape, never ownership.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMitzvahWorldDirectInventoryProjection,
	projectBootstrapInventorySnapshot
} from '../../launcher/MitzvahWorldDirectInventoryProjection.js';

test('direct inventory projection converts bootstrap quantities into truthful display stacks', () => {
	const projected = projectBootstrapInventorySnapshot({
		appearance: {},
		equipment: { hand: null },
		items: {
			'purifying-water': 2,
			'mystery-token': 1,
			'zero-item': 0
		}
	});
	assert.equal(projected.items.length, 2);
	const water = projected.items.find(stack => stack.itemId === 'purifying-water');
	assert.equal(water.quantity, 2);
	assert.equal(water.definition.name, 'Purifying Water');
	assert.equal(water.definition.icon, '💧');
	assert.deepEqual(water.definition.actions, []);
	const unknown = projected.items.find(stack => stack.itemId === 'mystery-token');
	assert.equal(unknown.definition.name, 'Mystery Token');
	assert.deepEqual(unknown.definition.actions, []);
	assert.deepEqual(projected.stats, { damage: 0, defense: 0, focus: 0 });
});

test('direct inventory projection follows canonical store changes without mutation authority', () => {
	let snapshot = {
		appearance: {},
		equipment: {},
		items: { 'purifying-water': 1 }
	};
	const listeners = new Set();
	const store = {
		onChange(listener) {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		snapshot() {
			return snapshot;
		}
	};
	const projection = createMitzvahWorldDirectInventoryProjection(store);
	assert.equal(projection.add, undefined);
	assert.equal(projection.remove, undefined);
	assert.equal(projection.diagnostics().canonicalStoreReused, true);
	let receipt = null;
	const unsubscribe = projection.onChange(value => {
		receipt = value;
	});
	snapshot = { ...snapshot, items: { 'purifying-water': 3 } };
	for (const listener of listeners) listener(snapshot);
	assert.equal(receipt.items[0].quantity, 3);
	assert.equal(projection.snapshot().items[0].quantity, 3);
	unsubscribe();
	assert.equal(listeners.size, 0);
});
