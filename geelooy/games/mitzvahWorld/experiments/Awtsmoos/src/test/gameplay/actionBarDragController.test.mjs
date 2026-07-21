// B"H
// Boruch Hashem
// Blessed is He

/** @file actionBarDragController.test.mjs @description Verifies all bounded drag transitions. */

import assert from 'node:assert/strict';
import test from 'node:test';
import { ActionBarDragController } from '../../gameplay/actionbar/ActionBarDragController.js';
import { ActionBarStore } from '../../gameplay/actionbar/ActionBarStore.js';

test('ability drags assign, move, and remove slots', () => {
	const events = [];
	const store = new ActionBarStore();
	const drag = new ActionBarDragController({
		bus: { emit: (type, detail) => events.push({ detail, type }) },
		store
	});
	drag.beginAbility('light-of-clarity');
	assert.equal(drag.dropOnSlot(0).ok, true);
	drag.beginSlot(0);
	assert.equal(drag.dropOnSlot(4).ok, true);
	assert.deepEqual(store.snapshot().slots.slice(0, 5), [null, null, null, null, 'light-of-clarity']);
	drag.beginSlot(4);
	assert.equal(drag.dropOutside().ok, true);
	assert.equal(store.snapshot().slots[4], null);
	assert.equal(drag.snapshot().active, false);
	assert.equal(events.at(-1).detail.reason, 'removed');
});

test('layout lock rejects a drop without losing the drag payload', () => {
	const store = new ActionBarStore();
	const drag = new ActionBarDragController({ store });
	drag.beginAbility('shield-of-trust');
	store.setLocked(true);
	assert.equal(drag.dropOnSlot(2).reason, 'layout-locked');
	assert.deepEqual(drag.snapshot(), {
		abilityId: 'shield-of-trust',
		active: true,
		source: 'library',
		sourceSlot: null
	});
	assert.equal(drag.cancel().reason, 'cancelled');
});
