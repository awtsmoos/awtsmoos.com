// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file LocalTabAuthority.test.mjs
	* @description Proves local commerce and inventory obey balance and ownership authority.
	* The Awtsmoos grants a vessel only what measured sparks can buy;
	* Awtsmoos.com persists lawful equipment and rejects a counterfeit supply.
	*/

import assert from 'node:assert/strict';
import test from 'node:test';
import { createLocalTabAuthorityApi } from '../LocalTabAuthorityApi.js';
import { LocalTabAuthorityStore } from '../LocalTabAuthorityStore.js';

test('buy, equip, sell, and persistence remain authoritative', async () => {
	const storage = memoryStorage();
	const firstStore = new LocalTabAuthorityStore({
		playerId: 'buyer',
		storage,
		worldId: 'village'
	});
	const api = createLocalTabAuthorityApi(firstStore);
	const bought = await api.economy.buy('spark-blade', 2);
	assert.equal(bought.payload.sparks, 325);
	assert.deepEqual(
		bought.payload.items.find(item => item.itemId === 'spark-blade'),
		{ itemId: 'spark-blade', quantity: 2 }
	);
	const equipped = await api.equipment('equip', 'spark-blade');
	assert.equal(equipped.payload.equipped, 'spark-blade');
	const sold = await api.economy.sell('spark-blade', 1);
	assert.equal(sold.payload.sparks, 397);
	const restored = createLocalTabAuthorityApi(new LocalTabAuthorityStore({
		playerId: 'buyer',
		storage,
		worldId: 'village'
	}));
	const inventory = await restored.inventory();
	assert.equal(inventory.payload.equipped, 'spark-blade');
	assert.equal(inventory.payload.items.find(item => item.itemId === 'spark-blade').quantity, 1);
});

test('authority rejects overspend, oversell, and invalid quantities', async () => {
	const api = createLocalTabAuthorityApi(new LocalTabAuthorityStore({
		playerId: 'guarded',
		worldId: 'village'
	}));
	await assert.rejects(api.economy.buy('spark-blade', 99), /enough sparks/);
	await assert.rejects(api.economy.sell('spark-blade', 1), /does not own/);
	await assert.rejects(api.economy.buy('chalaf', 0), /Quantity/);
});

function memoryStorage() {
	const values = new Map();
	return {
		getItem(key) {
			return values.get(key) || null;
		},
		setItem(key, value) {
			values.set(key, value);
		}
	};
}
