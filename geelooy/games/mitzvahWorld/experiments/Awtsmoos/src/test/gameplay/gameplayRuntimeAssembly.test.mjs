// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file gameplayRuntimeAssembly.test.mjs
 * @description Proves the assembled runtime connects hostile defeat events to canonical profile XP.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { InventoryStore } from '../../gameplay/InventoryStore.js';
import { ShliachProfileStore } from '../../gameplay/ShliachProfileStore.js';
import { assembleGameplayRuntime } from '../../ui/GameplayRuntimeAssembly.js';

class TestBus {
	constructor() {
		this.listeners = new Map();
	}

	on(type, listener) {
		if (!this.listeners.has(type)) this.listeners.set(type, new Set());
		this.listeners.get(type).add(listener);
		return () => this.listeners.get(type)?.delete(listener);
	}

	emit(type, detail) {
		for (const listener of this.listeners.get(type) || []) listener(detail);
	}
}

test('assembled progression awards exactly-once enemy XP through the shared bus', () => {
	const bus = new TestBus();
	const inventory = new InventoryStore();
	const profile = new ShliachProfileStore({ inventory });
	const runtime = assembleGameplayRuntime(bus, {
		actionBar: {},
		adventures: {},
		combat: {},
		inventory,
		melee: {},
		profile,
		shlichus: {}
	});
	const defeat = {
		combatLevel: 2,
		defeatReceipt: 'stalker:22.000',
		targetId: 'stalker',
		xpReward: 65
	};
	bus.emit('enemy:defeated', defeat);
	bus.emit('enemy:defeated', defeat);
	assert.equal(profile.snapshot().xp, 78);
	assert.equal(runtime.progression.snapshot().receiptCount, 1);
	runtime.progression.destroy();
	profile.destroy();
});
