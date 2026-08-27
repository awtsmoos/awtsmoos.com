// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file healingAmuletCommerce.test.mjs
 * @description Proves local fallback, websocket authority, narrow reconciliation, and local-tab isolation.
 * The Awtsmoos joins one Bag across solitary and connected worlds; Awtsmoos.com preserves unrelated
 * garments while expert purchases, amulet quantities, wallet truth, and bounded health reconcile exactly.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createHealingAmuletCommerce
} from '../../gameplay/HealingAmuletCommerce.js';
import {
	authorityMessage,
	commerceRuntime,
	EXPERT_ID
} from './HealingAmuletCommerceTestSupport.mjs';

test('local fallback purchases and uses one healing amulet', async () => {
	const runtime = commerceRuntime();
	const commerce = createHealingAmuletCommerce(runtime);
	await commerce.buy('written-healing-kamea', 1, EXPERT_ID);
	assert.equal(runtime.inventory.quantity('written-healing-kamea'), 1);
	assert.equal(runtime.inventory.quantity('perutas'), 96);
	runtime.playerStats.health = 70;
	const receipt = await commerce.use('written-healing-kamea');
	assert.equal(receipt.after, 92);
	assert.equal(runtime.inventory.quantity('written-healing-kamea'), 0);
});

test('websocket purchase reconciles only wallet and amulet stacks', async () => {
	const calls = [];
	const runtime = commerceRuntime({
		buy: async (...argumentsValue) => {
			calls.push(argumentsValue);
			return authorityMessage({
				inventory: [{ itemId: 'written-healing-kamea', quantity: 1 }],
				wallet: { mitzvahCoins: 76 }
			});
		}
	});
	const priorStaff = runtime.inventory.quantity('wooden-staff');
	await createHealingAmuletCommerce(runtime).buy(
		'written-healing-kamea',
		1,
		EXPERT_ID
	);
	assert.deepEqual(calls, [[
		'written-healing-kamea',
		1,
		EXPERT_ID
	]]);
	assert.equal(runtime.inventory.quantity('written-healing-kamea'), 1);
	assert.equal(runtime.inventory.quantity('perutas'), 76);
	assert.equal(runtime.inventory.quantity('wooden-staff'), priorStaff);
});

test('websocket use reconciles authoritative health and consumption', async () => {
	const runtime = commerceRuntime({
		useAmulet: async itemId => {
			assert.equal(itemId, 'root-herb-kamea');
			return {
				payload: {
					combat: {
						health: 88,
						maximumHealth: 100,
						status: 'active'
					},
					state: {
						inventory: [],
						wallet: { mitzvahCoins: 58 }
					}
				}
			};
		}
	});
	runtime.inventory.add('root-herb-kamea', 1);
	runtime.playerStats.health = 50;
	await createHealingAmuletCommerce(runtime).use('root-herb-kamea');
	assert.equal(runtime.playerStats.health, 88);
	assert.equal(runtime.inventory.quantity('root-herb-kamea'), 0);
	assert.equal(runtime.inventory.quantity('perutas'), 58);
});

test('local-tab transport never invokes websocket economy authority', async () => {
	let called = false;
	const runtime = commerceRuntime({
		buy: async () => {
			called = true;
		}
	}, 'local-tab');
	await createHealingAmuletCommerce(runtime).buy(
		'written-healing-kamea',
		1,
		EXPERT_ID
	);
	assert.equal(called, false);
	assert.equal(runtime.inventory.quantity('written-healing-kamea'), 1);
});
