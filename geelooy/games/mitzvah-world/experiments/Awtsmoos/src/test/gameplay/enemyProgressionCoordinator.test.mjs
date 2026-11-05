// B"H
// Boruch Hashem
// Blessed is He

/** @file enemyProgressionCoordinator.test.mjs @description Proves level-scaled exactly-once XP rewards. */

import assert from 'node:assert/strict';
import test from 'node:test';
import { EnemyProgressionCoordinator } from '../../gameplay/combat/EnemyProgressionCoordinator.js';
import { ShliachProfileStore } from '../../gameplay/ShliachProfileStore.js';

class TestBus {
	constructor() { this.listeners = new Map(); this.events = []; }
	on(type, listener) {
		if (!this.listeners.has(type)) this.listeners.set(type, new Set());
		this.listeners.get(type).add(listener);
		return () => this.listeners.get(type)?.delete(listener);
	}
	emit(type, detail) {
		this.events.push({ detail, type });
		for (const listener of this.listeners.get(type) || []) listener(detail);
	}
}

test('enemy defeat awards scaled XP once and new spawn receipts reward again', () => {
	const bus = new TestBus();
	const profile = new ShliachProfileStore();
	const coordinator = new EnemyProgressionCoordinator({ bus, profile, receiptLimit: 2 });
	const enemy = { combatLevel: 3, defeatReceipt: 'shade:22.000', targetId: 'shade', xpReward: 90 };
	bus.emit('enemy:defeated', enemy);
	bus.emit('enemy:defeated', enemy);
	assert.equal(profile.snapshot().xp, 126);
	bus.emit('enemy:defeated', { ...enemy, defeatReceipt: 'shade:44.000' });
	assert.equal(profile.snapshot().level, 2);
	assert.equal(profile.snapshot().xp, 52);
	assert.equal(bus.events.filter(event => event.type === 'player:experience').length, 2);
	assert.equal(coordinator.snapshot().receiptCount, 2);
	coordinator.destroy();
	profile.destroy();
});

test('profile state publishes the canonical level XP maximum', () => {
	const bus = new TestBus();
	const profile = new ShliachProfileStore();
	const coordinator = new EnemyProgressionCoordinator({ bus, profile });
	const state = bus.events.find(event => event.type === 'profile:state').detail;
	assert.equal(state.level, 1);
	assert.equal(state.xpMax, 200);
	assert.equal(state.armor, 3);
	coordinator.destroy();
	profile.destroy();
});
