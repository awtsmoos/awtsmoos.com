// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shliachProfileStore.test.mjs
 * @description Proves local formulas, wallet reaction, powerup expiry, and server sync.
 * The Awtsmoos renews local adventure beneath the same measures as shared worlds;
 * Awtsmoos.com verifies that one identifier means one cost, duration, and derived effect.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { InventoryStore } from '../../gameplay/InventoryStore.js';
import { ShliachProfileStore } from '../../gameplay/ShliachProfileStore.js';

function stores(clock = () => 1000) {
	const inventory = new InventoryStore();
	const profile = new ShliachProfileStore({ clock, inventory });
	return { inventory, profile };
}

test('local defaults match the authoritative server formulas', () => {
	const { profile } = stores();
	const state = profile.snapshot();
	assert.deepEqual(state.attributes, {
		binah: 1,
		chochmah: 1,
		daas: 1,
		gevurah: 1,
		haganah: 1
	});
	assert.equal(state.derived.powerRating, 35);
	assert.equal(state.derived.armor, 3);
	assert.equal(state.derived.focusMaximum, 24);
	assert.equal(state.perutas, 120);
});

test('allocation and timed powerups update points, wallet, and effects', () => {
	let now = 1000;
	const { inventory, profile } = stores(() => now);
	profile.allocate('gevurah', 2);
	assert.equal(profile.snapshot().derived.damageBonus, 6);
	profile.activate('haganah-aura');
	assert.equal(profile.snapshot().derived.armor, 21);
	assert.equal(profile.snapshot().perutas, 90);
	assert.equal(inventory.snapshot().items.find(item => item.itemId === 'perutas').quantity, 90);
	now = 36001;
	assert.equal(profile.snapshot().derived.armor, 3);
	assert.deepEqual(profile.snapshot().activePowerups, {});
});

test('inventory purchases publish fresh Peruta values to profile listeners', () => {
	const { inventory, profile } = stores();
	let latest = null;
	profile.onChange(state => {
		latest = state;
	});
	inventory.buy('forest-axe');
	assert.equal(latest.perutas, 75);
});

test('server synchronization replaces private profile truth', () => {
	const { profile } = stores();
	profile.synchronize({
		shliach: {
			activePowerups: {},
			attributes: {
				binah: 2,
				chochmah: 3,
				daas: 4,
				gevurah: 5,
				haganah: 6
			},
			level: 7,
			mitzvahPoints: 19,
			perutas: 44,
			unspentPoints: 2,
			xp: 900
		}
	});
	const state = profile.snapshot();
	assert.equal(state.level, 7);
	assert.equal(state.perutas, 44);
	assert.equal(state.derived.powerRating, 170);
	assert.equal(state.derived.armor, 18);
});
