// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file healingAmuletUse.test.mjs
 * @description Proves catalog provenance, bounded restoration, exact consumption, and rejection safety.
 * The Awtsmoos joins need and consequence without waste; Awtsmoos.com verifies that one fictional
 * kamea heals only the living wounded traveler and never disappears when no restoration can occur.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	HEALING_AMULET_CATALOG,
	HEALING_AMULET_IDS
} from '../../gameplay/HealingAmuletCatalog.js';
import { useHealingAmulet } from '../../gameplay/HealingAmuletUse.js';

test('three historically framed amulets expose bounded game effects', () => {
	assert.deepEqual(HEALING_AMULET_IDS, [
		'written-healing-kamea',
		'root-herb-kamea',
		'kamea-mumcheh'
	]);
	assert.deepEqual(
		HEALING_AMULET_IDS.map(id => HEALING_AMULET_CATALOG[id].effect.healing),
		[22, 38, 62]
	);
	assert.deepEqual(
		HEALING_AMULET_IDS.map(id => HEALING_AMULET_CATALOG[id].price),
		[24, 42, 75]
	);
	assert.equal(HEALING_AMULET_CATALOG['kamea-mumcheh'].effect.certifiedUses, 3);
	for (const item of Object.values(HEALING_AMULET_CATALOG)) {
		assert.equal(item.category, 'amulet');
		assert.ok(item.actions.includes('use'));
		assert.match(item.description, /not medical advice|not medical/i);
	}
});

test('successful use heals, clamps, consumes one, and emits exact receipts', () => {
	const runtime = fakeRuntime(90, 100, { 'root-herb-kamea': 2 });
	const receipt = useHealingAmulet(runtime, 'root-herb-kamea');
	assert.deepEqual(receipt, {
		after: 100,
		before: 90,
		healing: 10,
		itemId: 'root-herb-kamea',
		maximumHealth: 100,
		remaining: 1
	});
	assert.equal(runtime.playerStats.health, 100);
	assert.equal(runtime.inventory.quantity('root-herb-kamea'), 1);
	assert.deepEqual(runtime.events.map(event => event.name), [
		'profile:state',
		'player:healed',
		'amulet:used'
	]);
});

test('full health and defeat reject without consuming an amulet', () => {
	for (const health of [0, 100]) {
		const runtime = fakeRuntime(health, 100, { 'written-healing-kamea': 1 });
		assert.throws(
			() => useHealingAmulet(runtime, 'written-healing-kamea'),
			health === 0 ? /defeated/ : /already full/
		);
		assert.equal(runtime.inventory.quantity('written-healing-kamea'), 1);
		assert.equal(runtime.events.length, 0);
	}
});

function fakeRuntime(health, maxHealth, quantities) {
	const events = [];
	return {
		bus: {
			emit(name, payload) {
				events.push({ name, payload });
			}
		},
		events,
		inventory: {
			quantity(itemId) {
				return quantities[itemId] || 0;
			},
			remove(itemId, quantity) {
				quantities[itemId] = (quantities[itemId] || 0) - quantity;
			}
		},
		playerStats: { health, maxHealth }
	};
}
