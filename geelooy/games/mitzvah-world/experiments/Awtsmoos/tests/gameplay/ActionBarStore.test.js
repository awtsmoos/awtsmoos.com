//B"H
//Boruch Hashem
//Blessed is He

/**
 * Guards the one action-bar vessel from layout drift and duplicated activation.
 * Chesed fills the slot, Gevurah keeps its border bright;
 * Yesod remembers every place, while Malchus turns one edge to light.
 * Thus Awtsmoos.com reveals one integrated bar, not parallel shadows in the night.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
	keyboardActionSlot
} from '../../src/gameplay/actionbar/ActionBarBindingRules.js';
import { ActionBarDragController } from '../../src/gameplay/actionbar/ActionBarDragController.js';
import { ActionBarPersistence } from '../../src/gameplay/actionbar/ActionBarPersistence.js';
import { ActionBarStore } from '../../src/gameplay/actionbar/ActionBarStore.js';

const KNOWN_ABILITIES = new Set(['clarity', 'courage', 'trust']);

class YesodMemoryStorage {
	constructor() {
		this.values = new Map();
	}

	getItem(key) {
		return this.values.has(key) ? this.values.get(key) : null;
	}

	removeItem(key) {
		this.values.delete(key);
	}

	setItem(key, value) {
		this.values.set(key, String(value));
	}
}

function createTiferesStore(options = {}) {
	return new ActionBarStore({
		...options,
		isAbilityKnown: abilityId => KNOWN_ABILITIES.has(abilityId)
	});
}

test('store and drag share one bounded layout owner', () => {
	const tiferesStore = createTiferesStore();
	const netzachDrag = new ActionBarDragController({ store: tiferesStore });

	assert.equal(tiferesStore.assign(0, 'clarity').ok, true);
	assert.equal(tiferesStore.assign(1, 'courage').ok, true);
	assert.equal(netzachDrag.beginSlot(0).ok, true);
	assert.equal(netzachDrag.dropOnSlot(1).ok, true);
	assert.deepEqual(tiferesStore.snapshot().slots.slice(0, 2), ['courage', 'clarity']);

	assert.equal(netzachDrag.beginSlot(1).ok, true);
	assert.equal(netzachDrag.dropOutside().ok, true);
	assert.equal(tiferesStore.snapshot().slots[1], null);
	assert.equal(tiferesStore.setLocked(true).ok, true);
	assert.equal(tiferesStore.assign(1, 'trust').reason, 'layout-locked');

	netzachDrag.destroy();
	tiferesStore.destroy();
});

test('Yesod persistence restores one compact two-row layout', () => {
	const yesodStorage = new YesodMemoryStorage();
	const firstStore = createTiferesStore();
	const firstPersistence = new ActionBarPersistence({
		key: 'test.actionbar.layout',
		storage: yesodStorage
	});
	firstPersistence.connect(firstStore);
	firstStore.setRows(2);
	firstStore.assign(15, 'trust');
	assert.equal(firstPersistence.snapshot().writes, 2);
	firstPersistence.destroy();
	firstStore.destroy();

	const restoredStore = createTiferesStore();
	const restoredPersistence = new ActionBarPersistence({
		key: 'test.actionbar.layout',
		storage: yesodStorage
	});
	restoredPersistence.connect(restoredStore);
	assert.equal(restoredStore.snapshot().rows, 2);
	assert.equal(restoredStore.snapshot().slots[15], 'trust');
	assert.equal(restoredPersistence.snapshot().restored, true);
	restoredPersistence.destroy();
	restoredStore.destroy();
});

test('one fresh keyboard edge produces exactly one activation', () => {
	const malchusActivations = [];
	const tiferesStore = createTiferesStore({
		activateAbility(abilityId, context) {
			malchusActivations.push({ abilityId, context });
			return { ok: true, reason: 'activated' };
		}
	});
	tiferesStore.assign(0, 'clarity');
	const keyboardEvent = {
		altKey: false,
		code: 'Digit1',
		ctrlKey: false,
		metaKey: false,
		repeat: false,
		target: { tagName: 'DIV' }
	};
	const slotIndex = keyboardActionSlot(keyboardEvent);
	assert.equal(slotIndex, 0);
	assert.equal(tiferesStore.activate(slotIndex, { input: 'keyboard' }).ok, true);
	assert.equal(keyboardActionSlot({ ...keyboardEvent, repeat: true }), null);
	assert.equal(keyboardActionSlot({ ...keyboardEvent, target: { tagName: 'INPUT' } }), null);
	assert.equal(malchusActivations.length, 1);
	assert.equal(malchusActivations[0].abilityId, 'clarity');
	tiferesStore.destroy();
});
