// B"H
// Boruch Hashem
// Blessed is He

/** @file actionBarStore.test.mjs @description Verifies bounded action-bar layout transitions. */

import assert from 'node:assert/strict';
import test from 'node:test';
import { ActionBarStore } from '../../gameplay/actionbar/ActionBarStore.js';

test('abilities assign, move, remove, and respect the layout lock', () => {
	const store = new ActionBarStore({ isAbilityKnown: id => id.startsWith('torah-') });
	assert.equal(store.assign(0, 'torah-clarity').ok, true);
	assert.equal(store.move(0, 1).ok, true);
	assert.deepEqual(store.snapshot().slots.slice(0, 2), [null, 'torah-clarity']);
	store.setLocked(true);
	assert.deepEqual(store.remove(1), {
		ok: false,
		reason: 'layout-locked',
		snapshot: store.snapshot()
	});
	store.setLocked(false);
	assert.equal(store.remove(1).ok, true);
	assert.equal(store.snapshot().slots[1], null);
});

test('activation resolves one visible slot through the injected gateway', () => {
	const activations = [];
	const store = new ActionBarStore({
		activateAbility: (abilityId, context) => {
			activations.push({ abilityId, context });
			return { ok: true };
		}
	});
	store.assign(4, 'light-of-clarity');
	assert.deepEqual(store.activate(4, { source: 'keyboard' }), { ok: true });
	assert.deepEqual(activations, [{
		abilityId: 'light-of-clarity',
		context: { slotIndex: 4, source: 'keyboard' }
	}]);
	assert.equal(store.activate(5).reason, 'empty-slot');
});

test('restore preserves a bounded second row and discards unknown abilities', () => {
	const store = new ActionBarStore({
		isAbilityKnown: id => id === 'known',
		layout: {
			locked: true,
			rows: 2,
			slots: ['known', 'unknown', ...Array(22).fill(null)]
		}
	});
	const snapshot = store.snapshot();
	assert.equal(snapshot.rows, 2);
	assert.equal(snapshot.locked, true);
	assert.equal(snapshot.slots.length, 24);
	assert.deepEqual(snapshot.slots.slice(0, 2), ['known', null]);
});
