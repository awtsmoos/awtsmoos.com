// B"H
// Boruch Hashem
// Blessed is He

/** @file torahAbilityCooldownStore.test.mjs @description Verifies cooldown and charge recovery. */

import assert from 'node:assert/strict';
import test from 'node:test';
import { torahAbilityDefinition } from '../../gameplay/combat/TorahAbilityCatalog.js';
import { TorahAbilityCooldownStore } from '../../gameplay/combat/TorahAbilityCooldownStore.js';

test('single-charge ability observes global and local cooldowns then recovers', () => {
	const definition = torahAbilityDefinition('light-against-concealment');
	const store = new TorahAbilityCooldownStore();
	assert.equal(store.readiness(definition, 0).ok, true);
	assert.equal(store.commit(definition, 0), true);
	assert.equal(store.readiness(definition, 500).reason, 'global-cooldown');
	assert.equal(store.readiness(definition, 1050).reason, 'cooldown');
	assert.equal(store.readiness(definition, 1100).ok, true);
	assert.equal(store.readiness(definition, 1100).state.charges, 1);
});

test('multi-charge ability spends both charges and lazily recovers each one', () => {
	const definition = torahAbilityDefinition('joy-breaks-barriers');
	const store = new TorahAbilityCooldownStore();
	store.commit(definition, 0);
	assert.equal(store.readiness(definition, 1000).state.charges, 1);
	store.commit(definition, 1000);
	assert.equal(store.readiness(definition, 2000).reason, 'cooldown');
	assert.equal(store.readiness(definition, 11000).state.charges, 1);
	assert.equal(store.readiness(definition, 22000).state.charges, 2);
	assert.equal(store.snapshot(22000).diagnostics.activations, 2);
});

test('cleanup releases tracked cooldown state', () => {
	const store = new TorahAbilityCooldownStore();
	store.readiness(torahAbilityDefinition('grateful-awakening'), 0);
	store.destroy();
	assert.equal(store.snapshot(0).diagnostics.trackedAbilities, 0);
});
