// B"H
// Boruch Hashem
// Blessed is He

/** @file actionBarRuntimeCoordinator.test.mjs @description Verifies the integrated hotbar transaction. */

import assert from 'node:assert/strict';
import test from 'node:test';
import { ActionBarRuntimeCoordinator } from '../../gameplay/actionbar/ActionBarRuntimeCoordinator.js';

test('runtime separates restored catalog validity from learned readiness', () => {
	const learned = ['modeh-ani'];
	const runtime = createRuntime({ learned });
	assert.equal(runtime.assignFirstAvailable('light-against-concealment').ok, true);
	assert.equal(runtime.store.snapshot().slots[1], 'light-against-concealment');
	assert.equal(runtime.readinessForSlot(1, { now: 0 }).reason, 'not-unlocked');
	learned.push('creation-light');
	assert.equal(runtime.readinessForSlot(1, { now: 0 }).ok, true);
	runtime.store.setLocked(true);
	assert.equal(runtime.assignFirstAvailable('shield-of-trust').reason, 'layout-locked');
	runtime.destroy();
});

test('self and hostile slots use the canonical controller contract and exact status targets', () => {
	let now = 0;
	const requests = [];
	const runtime = createRuntime({
		clock: () => now,
		learned: ['modeh-ani', 'creation-light'],
		requests
	});
	assert.equal(runtime.activateSlot(0, { now }).ok, true);
	assert.equal(requests[0].options.worldImpactRequired, false);
	assert.equal(requests[0].options.targetRequired, false);
	assert.equal(runtime.statuses.snapshot('player').effects[0].effectId, 'returning-spark');

	now = 1100;
	runtime.store.assign(1, 'light-against-concealment');
	assert.equal(runtime.activateSlot(1, { now }).reason, 'casting');
	now = 1800;
	runtime.update(now);
	assert.equal(requests[1].options.worldImpactRequired, true);
	assert.equal(requests[1].options.targetRequired, true);
	assert.equal(runtime.statuses.snapshot('accepted-shade').effects[0].effectId, 'light-against-concealment');
	assert.equal(runtime.snapshot(now).persistence.connected, true);
	runtime.destroy();
	assert.equal(runtime.persistence.snapshot().connected, false);
});

function createRuntime(options = {}) {
	const learned = options.learned || ['modeh-ani'];
	const requests = options.requests || [];
	const storage = memoryStorage();
	return new ActionBarRuntimeCoordinator({
		bus: { emit() {} },
		clock: options.clock || (() => 0),
		combat: {
			snapshot() {
				return {
					focus: { current: 100, maximum: 100 },
					selectedTarget: { attackable: true, distance: 8, id: 'selected-shade' }
				};
			},
			usePassage(passage, requestOptions) {
				requests.push({ options: requestOptions, passage });
				return requestOptions.worldImpactRequired
					? { ok: true, targetIds: ['accepted-shade'] }
					: { ok: true };
			}
		},
		inventory: { snapshot: () => ({ learned: [...learned] }) },
		persistenceOptions: { key: 'test.runtime', storage }
	});
}

function memoryStorage() {
	const values = new Map();
	return {
		getItem: key => values.get(key) ?? null,
		removeItem: key => values.delete(key),
		setItem: (key, value) => values.set(key, value)
	};
}
