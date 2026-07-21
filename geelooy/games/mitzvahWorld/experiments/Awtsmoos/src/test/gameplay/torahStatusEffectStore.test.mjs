// B"H
// Boruch Hashem
// Blessed is He

/** @file torahStatusEffectStore.test.mjs @description Verifies the single bounded status timeline. */

import assert from 'node:assert/strict';
import test from 'node:test';
import { TorahStatusEffectStore } from '../../gameplay/combat/TorahStatusEffectStore.js';

test('periodic effects stack, tick with bounded catch-up, and expire', () => {
	const ticks = [];
	const store = new TorahStatusEffectStore({ clock: () => 0, onTick: effect => ticks.push(effect) });
	for (let index = 0; index < 4; index += 1) {
		store.apply({ effectId: 'flame-of-enthusiasm', now: 0, sourceId: 'player', targetId: 'shade' });
	}
	assert.equal(store.snapshot('shade').effects[0].stacks, 3);
	store.update(6500);
	assert.equal(ticks.length, 4);
	assert.equal(store.snapshot().diagnostics.droppedTicks, 2);
	store.update(7000);
	assert.equal(store.snapshot().diagnostics.activeCount, 0);
	assert.equal(store.snapshot().diagnostics.expired, 1);
});

test('boss behavior is explicit and damage breaks merciful restraint', () => {
	const store = new TorahStatusEffectStore({ clock: () => 0 });
	assert.equal(store.apply({
		effectId: 'merciful-restraint',
		isBoss: true,
		sourceId: 'player',
		targetId: 'boss'
	}).reason, 'boss-immune');
	assert.equal(store.apply({
		effectId: 'stillness-of-shabbos',
		isBoss: true,
		sourceId: 'player',
		targetId: 'boss'
	}).effect.bossScale, 0.5);
	store.apply({ effectId: 'merciful-restraint', sourceId: 'player', targetId: 'shade' });
	assert.equal(store.handleDamage('shade'), 1);
	assert.equal(store.snapshot('shade').effects.length, 0);
});

test('capacity, stronger replacement, cleanup, and event hooks remain deterministic', () => {
	const events = [];
	const bus = { emit: (type, detail) => events.push({ detail, type }) };
	const store = new TorahStatusEffectStore({ bus, clock: () => 0, maximumEffects: 1 });
	store.apply({ effectId: 'shield-of-trust', sourceId: 'player', strength: 2, targetId: 'player' });
	assert.equal(store.apply({
		effectId: 'shield-of-trust',
		sourceId: 'player',
		strength: 1,
		targetId: 'player'
	}).reason, 'weaker-effect');
	assert.equal(store.apply({
		effectId: 'voice-of-courage',
		sourceId: 'player',
		targetId: 'ally'
	}).reason, 'capacity');
	assert.equal(events.some(event => event.type === 'quest:event'), true);
	store.destroy();
	assert.equal(store.snapshot().diagnostics.activeCount, 0);
});
